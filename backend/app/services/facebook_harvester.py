"""
Facebook Graph API Harvester
============================
Pulls health-related posts from Kenya health organization Facebook Pages
using the Graph API (free, no unofficial scraping).

Targets: Kenya Ministry of Health, WHO Kenya, UNICEF Kenya, county health pages.

Phase 2 of social media data collection.
Follows the same pattern as twitter_harvester.py.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False

from app.models.social import SocialSignal, SentimentEnum

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# Pre-configured Kenya health organization Facebook pages
# ═══════════════════════════════════════════════════════════════════════════════
DEFAULT_HEALTH_PAGES = [
    {"id": "MOHKenya",          "name": "Kenya Ministry of Health"},
    {"id": "WHOKenya",          "name": "WHO Kenya"},
    {"id": "UNICEFKenya",       "name": "UNICEF Kenya"},
    {"id": "CDCKenya",          "name": "CDC Kenya"},
    {"id": "HealthKe",          "name": "Kenya Health"},
]

GRAPH_API_BASE = "https://graph.facebook.com/v19.0"

# Health keywords to filter posts
HEALTH_KEYWORDS = [
    "malaria", "cholera", "typhoid", "dengue", "outbreak", "epidemic",
    "disease", "fever", "infection", "health alert", "surveillance",
    "rift valley", "flu", "influenza", "diarrhea", "vaccination",
]

KENYAN_COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru",
    "Kisii", "Turkana", "West Pokot", "Garissa", "Kakamega", "Nyeri"
]


class FacebookHarvester:
    """
    Harvests health-related posts from public Facebook Pages via Graph API.

    Usage:
        harvester = FacebookHarvester(access_token, page_ids)
        posts = await harvester.search_health_posts(county="Nairobi")
    """

    def __init__(
        self,
        access_token: str = "",
        page_ids: str = "",
    ):
        self.access_token = access_token
        # Parse comma-separated page IDs; fall back to defaults if none given
        if page_ids:
            provided = [p.strip() for p in page_ids.split(",") if p.strip()]
            self._pages = [{"id": p, "name": p} for p in provided]
        else:
            self._pages = DEFAULT_HEALTH_PAGES

    def is_available(self) -> bool:
        """Check if Graph API token is configured and aiohttp is installed."""
        if not AIOHTTP_AVAILABLE:
            logger.warning("aiohttp not installed — Facebook harvester unavailable")
            return False
        if not self.access_token:
            logger.warning("FACEBOOK_ACCESS_TOKEN not configured in .env")
            return False
        return True

    async def search_health_posts(
        self,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 20,
    ) -> List[SocialSignal]:
        """
        Fetch posts from all configured health pages and filter for relevance.

        Args:
            county: Optional county to prioritize in content matching
            disease: Optional disease keyword to filter for
            limit: Max signals to return

        Returns:
            List of SocialSignal objects from real Facebook posts
        """
        if not self.is_available():
            return []

        signals = []
        per_page_limit = max(5, limit // len(self._pages) + 2)

        for page in self._pages:
            try:
                page_signals = await self.fetch_page_posts(
                    page_id=page["id"],
                    page_name=page["name"],
                    county=county,
                    disease=disease,
                    limit=per_page_limit,
                )
                signals.extend(page_signals)
                if len(signals) >= limit:
                    break
            except Exception as e:
                logger.warning(f"Facebook: Failed to fetch from page '{page['id']}': {e}")
                continue

        logger.info(f"Facebook: collected {len(signals)} health signals from pages")
        return signals[:limit]

    async def fetch_page_posts(
        self,
        page_id: str,
        page_name: str = "",
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 10,
        since_hours: int = 72,
    ) -> List[SocialSignal]:
        """
        Fetch recent posts from a single Facebook Page via Graph API.

        Args:
            page_id: Facebook Page ID or username
            page_name: Human-readable name (for signal labeling)
            county: County filter
            disease: Disease filter
            limit: Max posts to retrieve
            since_hours: Look back window in hours

        Returns:
            List of SocialSignal objects
        """
        since_ts = int((datetime.utcnow() - timedelta(hours=since_hours)).timestamp())
        url = f"{GRAPH_API_BASE}/{page_id}/posts"
        params = {
            "access_token": self.access_token,
            "fields": "id,message,created_time,permalink_url,reactions.summary(true)",
            "limit": min(limit * 3, 50),  # Fetch extra to filter by relevance
            "since": since_ts,
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logger.warning(f"Facebook API error {resp.status} for page '{page_id}': {text[:200]}")
                    return []
                data = await resp.json()

        posts = data.get("data", [])
        signals = []

        for post in posts:
            message = post.get("message", "") or ""
            if not message:
                continue

            # Filter: must contain health-relevant keywords
            if not self._is_health_relevant(message, county, disease):
                continue

            signal = self._parse_fb_post(post, page_name or page_id, county, disease)
            if signal:
                signals.append(signal)

            if len(signals) >= limit:
                break

        return signals

    def _is_health_relevant(
        self,
        text: str,
        county: Optional[str] = None,
        disease: Optional[str] = None,
    ) -> bool:
        """Filter posts to those mentioning health keywords (and optionally county/disease)."""
        text_lower = text.lower()

        # Disease-specific filter
        if disease and disease.replace("_", " ") in text_lower:
            return True

        # County filter
        if county and county.lower() in text_lower:
            # Any health keyword in county-specific post
            return any(kw in text_lower for kw in HEALTH_KEYWORDS)

        # General health keyword filter
        return any(kw in text_lower for kw in HEALTH_KEYWORDS)

    def _parse_fb_post(
        self,
        post: dict,
        page_name: str,
        county: Optional[str] = None,
        disease: Optional[str] = None,
    ) -> Optional[SocialSignal]:
        """Convert a Graph API post dict to a SocialSignal."""
        try:
            message = (post.get("message") or "")[:500]
            if not message:
                return None
            
            post_id = post.get("id", str(uuid4()))
            url = post.get("permalink_url")

            # Detect county and disease from content
            detected_county = county or self._detect_county(message)
            detected_disease = disease or self._detect_disease(message)

            # Engagement from reactions
            reactions_data = post.get("reactions", {}).get("summary", {})
            reaction_count = reactions_data.get("total_count", 0)
            engagement = min(1.0, reaction_count / 500)

            # Parse timestamp
            created_str = post.get("created_time", "")
            try:
                timestamp = datetime.strptime(created_str, "%Y-%m-%dT%H:%M:%S%z")
            except (ValueError, TypeError):
                timestamp = datetime.utcnow()

            # Sentiment analysis
            sentiment = self._analyze_sentiment(message)

            return SocialSignal(
                id=f"fb_{post_id}",
                signal_type="facebook_post",
                content=message,
                sentiment=sentiment,
                location=detected_county or "Kenya",
                disease_mentioned=detected_disease,
                source=f"Facebook / {page_name}",
                timestamp=timestamp,
                engagement_score=round(engagement, 2),
                platform_id=post_id,
                author_handle=page_name,
                url=url,
                is_verified_source=True,   # These are official health org pages
                data_source="facebook_live",
            )

        except Exception as e:
            logger.warning(f"Failed to parse Facebook post: {e}")
            return None

    def _detect_disease(self, text: str) -> Optional[str]:
        """Detect disease from post content."""
        text_lower = text.lower()
        disease_map = {
            "malaria": ["malaria", "mosquito fever", "antimalarial"],
            "cholera": ["cholera", "diarrhea outbreak", "contaminated water"],
            "typhoid": ["typhoid", "salmonella"],
            "dengue": ["dengue", "dengue fever"],
            "flu": ["flu", "influenza", "respiratory illness"],
            "rift_valley_fever": ["rift valley", "rvf"],
        }
        for disease, keywords in disease_map.items():
            if any(kw in text_lower for kw in keywords):
                return disease
        return None

    def _detect_county(self, text: str) -> Optional[str]:
        """Detect Kenyan county mentioned in post."""
        text_lower = text.lower()
        for county in KENYAN_COUNTIES:
            if county.lower() in text_lower:
                return county
        return None

    def _analyze_sentiment(self, text: str) -> SentimentEnum:
        """Simple rule-based sentiment for health posts."""
        text_lower = text.lower()
        urgent_words = ["urgent", "emergency", "critical", "outbreak", "epidemic", "surge", "crisis", "deaths"]
        negative_words = ["sick", "spreading", "infected", "rising", "hospital", "warning", "alert"]
        positive_words = ["recovered", "improving", "contained", "prevention", "vaccine", "safe", "declining"]

        if sum(1 for w in urgent_words if w in text_lower) >= 2:
            return SentimentEnum.URGENT
        if sum(1 for w in urgent_words if w in text_lower) >= 1:
            return SentimentEnum.URGENT
        neg = sum(1 for w in negative_words if w in text_lower)
        pos = sum(1 for w in positive_words if w in text_lower)
        if neg > pos:
            return SentimentEnum.NEGATIVE
        if pos > neg:
            return SentimentEnum.POSITIVE
        return SentimentEnum.NEUTRAL

    async def get_connection_status(self) -> dict:
        """Return connectivity status for the /status endpoint."""
        base = {
            "platform": "Facebook",
            "library": "aiohttp (Graph API v19.0)",
            "installed": AIOHTTP_AVAILABLE,
            "credentials_configured": bool(self.access_token),
            "pages_configured": len(self._pages),
            "authenticated": False,
            "status": "not_configured",
        }

        if not self.is_available():
            return base

        # Quick connectivity check — fetch the first page's metadata
        try:
            page_id = self._pages[0]["id"] if self._pages else "me"
            url = f"{GRAPH_API_BASE}/{page_id}"
            params = {"access_token": self.access_token, "fields": "name,id"}
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        base["authenticated"] = True
                        base["status"] = "connected"
                    else:
                        base["status"] = "token_invalid"
        except Exception as e:
            base["status"] = f"error: {str(e)[:80]}"

        return base
