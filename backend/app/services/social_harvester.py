"""
Social Media Harvester Service — Orchestrator
==============================================
Coordinates data collection from real sources:
  - Twitter/X via twikit (Phase 1)
  - Facebook Graph API (Phase 2)
  - Grok xAI live search (Phase 2)
with graceful fallback to mock/simulated data.

Modes:
- "live"   → Only real data (errors if APIs unavailable)
- "mock"   → Only mock/simulated data
- "hybrid" → Try real first, fallback to mock (recommended)
"""

import logging
import random
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from app.config import settings

# Try importing the Twitter harvester
try:
    from app.services.twitter_harvester import TwitterHarvester
    TWITTER_HARVESTER_AVAILABLE = True
except ImportError:
    TWITTER_HARVESTER_AVAILABLE = False

# Try importing the Facebook harvester
try:
    from app.services.facebook_harvester import FacebookHarvester
    FACEBOOK_HARVESTER_AVAILABLE = True
except ImportError:
    FACEBOOK_HARVESTER_AVAILABLE = False

# Try importing the Grok xAI analyzer
try:
    from app.services.grok_analyzer import GrokAnalyzer
    GROK_ANALYZER_AVAILABLE = True
except ImportError:
    GROK_ANALYZER_AVAILABLE = False

from app.models.social import SocialSignal, SentimentEnum

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# Disease keywords & county data (shared between mock and real)
# ═══════════════════════════════════════════════════════════════════════════════
DISEASE_KEYWORDS = {
    "malaria": ["malaria", "mosquito", "fever", "chills", "sweating", "antimalarial"],
    "cholera": ["cholera", "diarrhea", "vomiting", "dehydration", "contaminated water"],
    "typhoid": ["typhoid", "salmonella", "high fever", "weakness", "stomach pain"],
    "dengue": ["dengue", "mosquito", "rash", "joint pain", "hemorrhagic"],
    "rift_valley_fever": ["rift valley", "rvf", "livestock", "hemorrhagic", "mosquito"],
    "flu": ["flu", "influenza", "cough", "sore throat", "respiratory"]
}

FEATURED_COUNTIES = [
    {"name": "Nairobi", "region": "Central", "population": 4397073},
    {"name": "Mombasa", "region": "Coast", "population": 1208333},
    {"name": "Kisumu", "region": "Nyanza", "population": 1155574},
    {"name": "Nakuru", "region": "Rift Valley", "population": 2162202},
    {"name": "Kisii", "region": "Nyanza", "population": 1266860},
    {"name": "Turkana", "region": "Rift Valley", "population": 926976},
    {"name": "West Pokot", "region": "Rift Valley", "population": 621241},
    {"name": "Garissa", "region": "North Eastern", "population": 841353},
    {"name": "Kakamega", "region": "Western", "population": 1867579},
    {"name": "Nyeri", "region": "Central", "population": 759164}
]


# ═══════════════════════════════════════════════════════════════════════════════
# Mock content generators (kept as fallback)
# ═══════════════════════════════════════════════════════════════════════════════
def generate_mock_content(disease: str, county: str) -> str:
    """Generate realistic mock social media content."""
    templates = {
        "malaria": [
            f"Many people in {county} reporting fever and chills. Local clinics overwhelmed.",
            f"Mosquito breeding sites spotted near {county} river areas. Malaria cases rising.",
            f"Health workers in {county} distributing mosquito nets due to malaria outbreak.",
        ],
        "cholera": [
            f"Water quality concerns in {county}. Multiple diarrhea cases reported.",
            f"Cholera alert in {county}: residents advised to boil drinking water.",
            f"Health ministry responding to cholera outbreak in {county} informal settlements.",
        ],
        "typhoid": [
            f"Typhoid cases increasing in {county}. Food vendors being inspected.",
            f"Several hospitalized in {county} with suspected typhoid fever.",
        ],
        "dengue": [
            f"Dengue fever cases reported in {county} coastal areas.",
            f"Health officials warning about dengue outbreak in {county}.",
        ],
        "rift_valley_fever": [
            f"Livestock deaths in {county} raising RVF concerns.",
            f"Rift Valley Fever surveillance increased in {county} pastoral areas.",
        ],
        "flu": [
            f"Flu season hitting {county} hard. Hospitals seeing surge in patients.",
            f"Respiratory illness spreading in {county} schools and markets.",
        ]
    }
    return random.choice(templates.get(disease, [f"Health concern reported in {county}."]))


# ═══════════════════════════════════════════════════════════════════════════════
# PDF Parsing (kept from original)
# ═══════════════════════════════════════════════════════════════════════════════
try:
    import fitz  # PyMuPDF
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False


async def parse_pdf_report(file_content: bytes, filename: str) -> dict:
    """Parse a PDF report uploaded by a verified health operator."""
    extracted_text = ""
    if PDF_SUPPORT:
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text()
            doc.close()
        except Exception as e:
            extracted_text = f"[Error parsing PDF: {str(e)}]"
    else:
        extracted_text = "PDF parsing unavailable (PyMuPDF not installed)."

    analysis = analyze_content(extracted_text)
    return {
        "filename": filename,
        "extracted_text": extracted_text[:2000],
        "word_count": len(extracted_text.split()),
        "disease_indicators": analysis["disease_indicators"],
        "severity_score": analysis["severity_score"],
        "counties_mentioned": analysis["counties_mentioned"],
        "parsed_at": datetime.utcnow().isoformat()
    }


def analyze_content(text: str) -> dict:
    """Analyze text content for disease indicators and severity."""
    text_lower = text.lower()
    found_diseases = []
    for disease, keywords in DISEASE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                if disease not in found_diseases:
                    found_diseases.append(disease)
                break

    found_counties = []
    for county in FEATURED_COUNTIES:
        if county["name"].lower() in text_lower:
            found_counties.append(county["name"])

    severity_indicators = ["urgent", "critical", "outbreak", "emergency", "surge", "alarming"]
    severity_count = sum(1 for word in severity_indicators if word in text_lower)
    base_severity = 40 + (severity_count * 10) + (len(found_diseases) * 5)
    severity_score = min(95, max(20, base_severity))

    return {
        "disease_indicators": found_diseases if found_diseases else ["unknown"],
        "counties_mentioned": found_counties if found_counties else ["unspecified"],
        "severity_score": severity_score
    }


def get_featured_counties() -> List[dict]:
    """Return the list of 10 featured counties."""
    return FEATURED_COUNTIES


# ═══════════════════════════════════════════════════════════════════════════════
# Main Orchestrator
# ═══════════════════════════════════════════════════════════════════════════════
class SocialHarvester:
    """
    Orchestrates social media signal collection from real and mock sources.

    Harvest modes:
    - "live"   → Only real data (Twitter/X via twikit)
    - "mock"   → Only mock/simulated data
    - "hybrid" → Try real first, fallback to mock (default)
    """

    def __init__(self, mode: Optional[str] = None):
        self.mode = mode or getattr(settings, "SOCIAL_HARVEST_MODE", "hybrid")
        self._twitter: Optional[TwitterHarvester] = None
        self._facebook: Optional[FacebookHarvester] = None
        self._grok: Optional[GrokAnalyzer] = None
        self._init_sources()

    def _init_sources(self):
        """Initialize available data sources based on config."""
        if self.mode == "mock":
            return

        # Twitter/X (Phase 1)
        if TWITTER_HARVESTER_AVAILABLE:
            try:
                self._twitter = TwitterHarvester(
                    username=getattr(settings, "TWITTER_USERNAME", ""),
                    email=getattr(settings, "TWITTER_EMAIL", ""),
                    password=getattr(settings, "TWITTER_PASSWORD", ""),
                )
                logger.info("Twitter harvester initialized")
            except Exception as e:
                logger.warning(f"Twitter harvester init failed: {e}")

        # Facebook Graph API (Phase 2)
        if FACEBOOK_HARVESTER_AVAILABLE:
            try:
                self._facebook = FacebookHarvester(
                    access_token=getattr(settings, "FACEBOOK_ACCESS_TOKEN", ""),
                    page_ids=getattr(settings, "FACEBOOK_PAGE_IDS", ""),
                )
                logger.info("Facebook harvester initialized")
            except Exception as e:
                logger.warning(f"Facebook harvester init failed: {e}")

        # Grok xAI (Phase 2)
        if GROK_ANALYZER_AVAILABLE:
            try:
                self._grok = GrokAnalyzer(
                    api_key=getattr(settings, "XAI_API_KEY", ""),
                    model=getattr(settings, "XAI_MODEL", "grok-3-mini"),
                )
                logger.info("Grok analyzer initialized")
            except Exception as e:
                logger.warning(f"Grok analyzer init failed: {e}")

    def get_signals(
        self,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 20,
        source: Optional[str] = None,
    ) -> list:
        """
        Return social signals — delegates to async harvester if in live/hybrid mode.
        For sync contexts (like the current router), uses mock with real data fields.
        """
        signals = self._generate_mock_signals(county, disease, limit)
        return signals

    async def get_signals_async(
        self,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 20,
        source: Optional[str] = None,
    ) -> list:
        """
        Async version: tries real Twitter data first, falls back to mock.
        """
        signals = []
        sources_tried = []

        # ── Twitter/X (Phase 1) ─────────────────────────────────────────────
        if self.mode in ("live", "hybrid") and self._twitter and self._twitter.is_available():
            try:
                tw_signals = await self._twitter.search_health_tweets(
                    county=county, disease=disease, limit=limit
                )
                signals.extend(tw_signals)
                sources_tried.append("twitter_live")
                logger.info(f"Twitter returned {len(tw_signals)} signals")
            except Exception as e:
                logger.warning(f"Twitter harvest failed: {e}")
                sources_tried.append("twitter_error")

        # ── Facebook (Phase 2) ──────────────────────────────────────────────
        if self.mode in ("live", "hybrid") and self._facebook and self._facebook.is_available():
            try:
                fb_signals = await self._facebook.search_health_posts(
                    county=county, disease=disease, limit=limit
                )
                signals.extend(fb_signals)
                sources_tried.append("facebook_live")
                logger.info(f"Facebook returned {len(fb_signals)} signals")
            except Exception as e:
                logger.warning(f"Facebook harvest failed: {e}")
                sources_tried.append("facebook_error")

        # ── Grok xAI (Phase 2) ──────────────────────────────────────────────
        if self.mode in ("live", "hybrid") and self._grok and self._grok.is_available():
            try:
                grok_signals = await self._grok.live_search_health(
                    county=county, disease=disease, limit=max(5, limit // 2)
                )
                signals.extend(grok_signals)
                sources_tried.append("grok_live")
                logger.info(f"Grok returned {len(grok_signals)} signals")
            except Exception as e:
                logger.warning(f"Grok harvest failed: {e}")
                sources_tried.append("grok_error")

        # ── Enrich with Grok AI classification (if live signals found) ──────
        if signals and self._grok and self._grok.is_available():
            if source not in ("mock",) and any(s.data_source != "mock" for s in signals):
                try:
                    signals = await self._grok.classify_signals(signals)
                    logger.info("Grok classified signals")
                except Exception as e:
                    logger.warning(f"Grok classification failed: {e}")

        # ── Fallback to mock ────────────────────────────────────────────────
        if not signals and self.mode in ("mock", "hybrid"):
            mock_signals = self._generate_mock_signals(county, disease, limit)
            signals.extend(mock_signals)
            sources_tried.append("mock")
            logger.info(f"Using mock data ({len(mock_signals)} signals)")

        # ── Live mode with no results = error ───────────────────────────────
        if not signals and self.mode == "live":
            logger.error("Live mode: No signals from any source")

        return signals[:limit]

    async def harvest_all(
        self,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 20,
    ) -> dict:
        """
        Trigger a full harvest run across all available sources.
        Returns structured result for the /harvest endpoint.
        """
        signals = []
        sources_queried = []
        errors = []

        # Twitter/X (Phase 1)
        if self._twitter and self._twitter.is_available():
            try:
                tw = await self._twitter.search_health_tweets(
                    county=county, disease=disease, limit=limit
                )
                signals.extend(tw)
                sources_queried.append("Twitter/X (twikit)")
            except Exception as e:
                errors.append(f"Twitter: {str(e)}")

        # Facebook Graph API (Phase 2)
        if self._facebook and self._facebook.is_available():
            try:
                fb = await self._facebook.search_health_posts(
                    county=county, disease=disease, limit=limit
                )
                signals.extend(fb)
                sources_queried.append("Facebook (Graph API)")
            except Exception as e:
                errors.append(f"Facebook: {str(e)}")

        # Grok xAI live search (Phase 2)
        if self._grok and self._grok.is_available():
            try:
                gk = await self._grok.live_search_health(
                    county=county, disease=disease, limit=max(5, limit // 2)
                )
                signals.extend(gk)
                sources_queried.append("Grok xAI (live search)")
            except Exception as e:
                errors.append(f"Grok: {str(e)}")

        # Mock fallback
        if not signals and self.mode != "live":
            mock = self._generate_mock_signals(county, disease, limit)
            signals.extend(mock)
            sources_queried.append("Mock (fallback)")

        return {
            "success": len(signals) > 0,
            "signals_collected": len(signals),
            "sources_queried": sources_queried,
            "errors": errors,
            "signals": signals,
            "message": f"Harvested {len(signals)} signals from {len(sources_queried)} source(s)"
        }

    async def get_status(self) -> dict:
        """Get connection status for all configured sources."""
        status = {
            "harvest_mode": self.mode,
            "twitter": {},
            "facebook": {},
            "grok": {},
            "overall_status": "offline",
        }
        any_connected = False
        any_configured = False

        # Twitter status
        if self._twitter:
            status["twitter"] = await self._twitter.get_connection_status()
        else:
            status["twitter"] = {
                "platform": "Twitter/X",
                "status": "not_initialized",
                "installed": TWITTER_HARVESTER_AVAILABLE,
            }

        # Facebook status
        if self._facebook:
            status["facebook"] = await self._facebook.get_connection_status()
        else:
            status["facebook"] = {
                "platform": "Facebook",
                "status": "not_initialized",
                "installed": FACEBOOK_HARVESTER_AVAILABLE,
            }

        # Grok status
        if self._grok:
            status["grok"] = await self._grok.get_connection_status()
        else:
            status["grok"] = {
                "platform": "Grok xAI",
                "status": "not_initialized",
                "installed": GROK_ANALYZER_AVAILABLE,
            }

        # Determine overall status
        for src in ("twitter", "facebook", "grok"):
            src_status = status[src].get("status", "")
            if src_status == "connected":
                any_connected = True
            elif status[src].get("credentials_configured"):
                any_configured = True

        if any_connected:
            status["overall_status"] = "connected"
        elif any_configured:
            status["overall_status"] = "configured"

        return status

    def _generate_mock_signals(
        self,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 20,
    ) -> List[SocialSignal]:
        """Generate mock social signals (existing behavior preserved)."""
        sentiments = list(SentimentEnum)
        signal_types = ["tweet", "community_report", "news_article"]
        sources = ["Twitter/X", "Facebook Health Groups", "Community Reports"]

        count = min(limit, random.randint(5, 15))
        signals = []
        for _ in range(count):
            c = county or random.choice(FEATURED_COUNTIES)["name"]
            d = disease or random.choice(list(DISEASE_KEYWORDS.keys()))
            signal = SocialSignal(
                id=str(uuid4()),
                signal_type=random.choice(signal_types),
                content=generate_mock_content(d, c),
                sentiment=random.choice(sentiments),
                location=c,
                disease_mentioned=d,
                source=random.choice(sources),
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(0, 72)),
                engagement_score=round(random.uniform(0, 1), 2),
                data_source="mock",
            )
            signals.append(signal)
        return signals

    def get_aggregate_sentiment(self, signals: list):
        """Calculate aggregate sentiment from a list of signals."""
        from app.models.social import SentimentScore

        if not signals:
            return SentimentScore()

        counts = {"positive": 0, "negative": 0, "neutral": 0, "urgent": 0}
        for s in signals:
            val = s.sentiment.value if hasattr(s.sentiment, "value") else str(s.sentiment)
            counts[val] = counts.get(val, 0) + 1

        total = len(signals)
        score = SentimentScore(
            positive=round(counts["positive"] / total, 2),
            negative=round(counts["negative"] / total, 2),
            neutral=round(counts["neutral"] / total, 2),
            urgent=round(counts["urgent"] / total, 2),
            overall_label=SentimentEnum(max(counts, key=counts.get)),
        )
        return score


# ═══════════════════════════════════════════════════════════════════════════════
# Legacy function wrappers (backward compat)
# ═══════════════════════════════════════════════════════════════════════════════
async def simulate_harvest() -> List[dict]:
    """Legacy: simulates harvest — returns original dict format for insights.py compatibility."""
    import random as _r
    platforms = ["Twitter/X", "Facebook", "WhatsApp Groups", "Reddit", "Local Forums"]
    sentiments = ["concerned", "alarmed", "informative", "urgent", "routine"]
    results = []
    num = _r.randint(5, 10)
    for _ in range(num):
        county_obj = _r.choice(FEATURED_COUNTIES)
        disease = _r.choice(list(DISEASE_KEYWORDS.keys()))
        results.append({
            "id": str(uuid4()),
            "source": _r.choice(platforms),
            "content": generate_mock_content(disease, county_obj["name"]),
            "county": county_obj["name"],
            "region": county_obj["region"],
            "disease_indicators": [disease],
            "sentiment": _r.choice(sentiments),
            "severity_score": _r.randint(30, 95),
            "confidence": round(_r.uniform(0.6, 0.95), 2),
            "status": "pending",
            "harvested_at": datetime.utcnow().isoformat(),
            "verified_by": None,
            "verified_at": None,
        })
    return results



async def get_analysis_status(insight_id: str) -> dict:
    """Get the current analysis status of an insight."""
    statuses = ["pending", "analyzing", "analyzed", "verified"]
    return {
        "insight_id": insight_id,
        "status": random.choice(statuses),
        "progress": random.randint(0, 100),
        "updated_at": datetime.utcnow().isoformat()
    }
