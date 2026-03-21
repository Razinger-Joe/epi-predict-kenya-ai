"""
Twitter/X Data Harvester via twikit
====================================
Pulls real health-related tweets from Twitter/X for disease surveillance.
Uses twikit (free, unofficial) — no paid API key required.

Phase 1 of social media data collection.
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

try:
    from twikit import Client as TwikitClient
    TWIKIT_AVAILABLE = True
except ImportError:
    TWIKIT_AVAILABLE = False

from app.models.social import SocialSignal, SentimentEnum

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# Disease keyword queries for Kenya health surveillance
# ═══════════════════════════════════════════════════════════════════════════════
DISEASE_QUERIES = {
    "malaria": ["malaria", "mosquito fever", "antimalarial", "mosquito net"],
    "cholera": ["cholera", "diarrhea outbreak", "contaminated water", "boil water"],
    "typhoid": ["typhoid", "salmonella", "food poisoning fever"],
    "dengue": ["dengue", "dengue fever", "mosquito rash"],
    "flu": ["flu", "influenza", "respiratory illness", "cough outbreak"],
    "rift_valley_fever": ["rift valley fever", "rvf", "livestock deaths"],
}

KENYAN_COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru",
    "Kisii", "Turkana", "West Pokot", "Garissa", "Kakamega", "Nyeri"
]

# Path to store session cookies (avoids re-login)
COOKIES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "twikit_cookies.json")


class TwitterHarvester:
    """
    Harvests health-related tweets from Twitter/X using twikit.

    Usage:
        harvester = TwitterHarvester(username, email, password)
        await harvester.authenticate()
        signals = await harvester.search_health_tweets(["malaria"], "Nairobi")
    """

    def __init__(
        self,
        username: str = "",
        email: str = "",
        password: str = "",
    ):
        self.username = username
        self.email = email
        self.password = password
        self._client: Optional[object] = None
        self._authenticated = False

    def is_available(self) -> bool:
        """Check if twikit is installed and credentials are configured."""
        if not TWIKIT_AVAILABLE:
            logger.warning("twikit package not installed. Run: pip install twikit")
            return False
        if not self.username or not self.password:
            logger.warning("Twitter credentials not configured in .env")
            return False
        return True

    async def authenticate(self) -> bool:
        """
        Login to Twitter/X via twikit session cookies.
        Caches cookies to disk so we don't re-login every time.
        """
        if not self.is_available():
            return False

        try:
            self._client = TwikitClient("en-US")

            # Try loading saved cookies first
            if os.path.exists(COOKIES_PATH):
                try:
                    self._client.load_cookies(COOKIES_PATH)
                    self._authenticated = True
                    logger.info("✅ Twitter: Loaded saved session cookies")
                    return True
                except Exception:
                    logger.info("Saved cookies expired, re-authenticating...")

            # Fresh login
            await self._client.login(
                auth_info_1=self.username,
                auth_info_2=self.email,
                password=self.password,
            )
            self._client.save_cookies(COOKIES_PATH)
            self._authenticated = True
            logger.info("✅ Twitter: Authenticated successfully via twikit")
            return True

        except Exception as e:
            logger.error(f"❌ Twitter authentication failed: {e}")
            self._authenticated = False
            return False

    async def search_health_tweets(
        self,
        keywords: Optional[List[str]] = None,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 20,
    ) -> List[SocialSignal]:
        """
        Search Twitter/X for health-related tweets about Kenya.

        Args:
            keywords: Specific keywords to search (overrides disease)
            county: Filter to a specific county
            disease: Disease type to search for (uses predefined queries)
            limit: Maximum number of tweets to return

        Returns:
            List of SocialSignal objects from real tweets
        """
        if not self._authenticated:
            auth_ok = await self.authenticate()
            if not auth_ok:
                logger.warning("Twitter not authenticated, returning empty")
                return []

        try:
            # Build search query
            query = self._build_query(keywords, county, disease)
            logger.info(f"🔍 Twitter search: '{query}' (limit={limit})")

            # Execute search
            tweets = await self._client.search_tweet(query, product="Latest", count=limit)

            signals = []
            for tweet in tweets:
                signal = self._parse_tweet(tweet, county, disease)
                if signal:
                    signals.append(signal)

            logger.info(f"✅ Twitter: Found {len(signals)} health-related tweets")
            return signals[:limit]

        except Exception as e:
            logger.error(f"❌ Twitter search failed: {e}")
            return []

    def _build_query(
        self,
        keywords: Optional[List[str]] = None,
        county: Optional[str] = None,
        disease: Optional[str] = None,
    ) -> str:
        """Build a Twitter search query from keywords, county, and disease."""
        parts = []

        if keywords:
            # Use provided keywords
            parts.append(" OR ".join(keywords))
        elif disease and disease in DISEASE_QUERIES:
            # Use disease-specific keywords
            disease_kws = DISEASE_QUERIES[disease][:3]  # Top 3 keywords
            parts.append(" OR ".join(f'"{kw}"' for kw in disease_kws))
        else:
            # Generic health search for Kenya
            parts.append(
                '"malaria" OR "cholera" OR "typhoid" OR "outbreak" OR "epidemic"'
            )

        # Add county filter
        if county:
            parts.append(f'"{county}"')

        # Always include Kenya context
        parts.append("Kenya")

        # Exclude retweets for cleaner data
        parts.append("-is:retweet")

        return " ".join(parts)

    def _parse_tweet(
        self,
        tweet,
        county: Optional[str] = None,
        disease: Optional[str] = None,
    ) -> Optional[SocialSignal]:
        """Convert a twikit tweet object into a SocialSignal model."""
        try:
            text = getattr(tweet, "text", "") or ""
            tweet_id = getattr(tweet, "id", str(uuid4()))

            # Detect disease from content if not specified
            detected_disease = disease
            if not detected_disease:
                detected_disease = self._detect_disease(text)

            # Detect county from content if not specified
            detected_county = county
            if not detected_county:
                detected_county = self._detect_county(text)

            # Simple sentiment analysis based on urgency keywords
            sentiment = self._analyze_sentiment(text)

            # Calculate engagement score
            likes = getattr(tweet, "favorite_count", 0) or 0
            retweets = getattr(tweet, "retweet_count", 0) or 0
            engagement = min(1.0, (likes + retweets * 2) / 1000)

            # Get author info
            user = getattr(tweet, "user", None)
            author = f"@{user.screen_name}" if user and hasattr(user, "screen_name") else None
            is_verified = getattr(user, "verified", False) if user else False

            # Parse timestamp
            created_at = getattr(tweet, "created_at", None)
            if isinstance(created_at, str):
                try:
                    timestamp = datetime.strptime(created_at, "%a %b %d %H:%M:%S %z %Y")
                except ValueError:
                    timestamp = datetime.utcnow()
            elif isinstance(created_at, datetime):
                timestamp = created_at
            else:
                timestamp = datetime.utcnow()

            return SocialSignal(
                id=f"tw_{tweet_id}",
                signal_type="tweet",
                content=text[:500],  # Truncate long tweets
                sentiment=sentiment,
                location=detected_county or "Kenya",
                disease_mentioned=detected_disease,
                source="Twitter/X",
                timestamp=timestamp,
                engagement_score=round(engagement, 2),
                platform_id=str(tweet_id),
                author_handle=author,
                url=f"https://x.com/i/status/{tweet_id}" if tweet_id else None,
                is_verified_source=is_verified,
                data_source="twitter_live",
            )

        except Exception as e:
            logger.warning(f"Failed to parse tweet: {e}")
            return None

    def _detect_disease(self, text: str) -> Optional[str]:
        """Detect which disease a tweet is about from its content."""
        text_lower = text.lower()
        for disease, keywords in DISEASE_QUERIES.items():
            for kw in keywords:
                if kw.lower() in text_lower:
                    return disease
        return None

    def _detect_county(self, text: str) -> Optional[str]:
        """Detect which Kenyan county a tweet mentions."""
        text_lower = text.lower()
        for county in KENYAN_COUNTIES:
            if county.lower() in text_lower:
                return county
        return None

    def _analyze_sentiment(self, text: str) -> SentimentEnum:
        """Simple rule-based sentiment analysis for health tweets."""
        text_lower = text.lower()

        urgent_words = [
            "urgent", "emergency", "critical", "outbreak", "epidemic",
            "overwhelmed", "alarming", "surge", "deaths", "dying",
            "help", "desperate", "crisis"
        ]
        negative_words = [
            "sick", "spreading", "infected", "cases", "rising",
            "hospital", "fever", "diarrhea", "vomiting", "concerned",
            "warning", "alert", "increasing"
        ]
        positive_words = [
            "recovered", "improving", "contained", "dropping",
            "prevention", "vaccine", "treated", "safe", "declining"
        ]

        urgent_count = sum(1 for w in urgent_words if w in text_lower)
        negative_count = sum(1 for w in negative_words if w in text_lower)
        positive_count = sum(1 for w in positive_words if w in text_lower)

        if urgent_count >= 2:
            return SentimentEnum.URGENT
        if negative_count > positive_count:
            return SentimentEnum.NEGATIVE
        if positive_count > negative_count:
            return SentimentEnum.POSITIVE
        return SentimentEnum.NEUTRAL

    async def get_connection_status(self) -> dict:
        """Return current connection status for the /status endpoint."""
        return {
            "platform": "Twitter/X",
            "library": "twikit",
            "installed": TWIKIT_AVAILABLE,
            "credentials_configured": bool(self.username and self.password),
            "authenticated": self._authenticated,
            "status": "connected" if self._authenticated else (
                "not_configured" if not (self.username and self.password) else "disconnected"
            ),
        }
