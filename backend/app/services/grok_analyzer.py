"""
Grok xAI Analyzer
==================
Uses Grok's OpenAI-compatible API with live search to find real-time health
posts across X (Twitter) and the web, then classifies them as disease signals.

Two modes:
  1. live_search_health() — finds NEW content via Grok's search tool
  2. classify_signals()   — enriches existing signals with AI scoring

API endpoint: https://api.x.ai/v1/chat/completions
Sources: X posts, web articles, news (via search grounding)

Phase 2 of social media data collection.
"""

import json
import logging
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False

from app.models.social import SocialSignal, SentimentEnum

logger = logging.getLogger(__name__)

XAI_BASE_URL = "https://api.x.ai/v1"

KENYAN_COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru",
    "Kisii", "Turkana", "West Pokot", "Garissa", "Kakamega", "Nyeri"
]

DISEASE_NAMES = {
    "malaria": "malaria",
    "cholera": "cholera",
    "typhoid": "typhoid fever",
    "dengue": "dengue fever",
    "flu": "influenza",
    "rift_valley_fever": "Rift Valley Fever",
}


class GrokAnalyzer:
    """
    AI-powered social signal discovery and classification using Grok xAI.

    Examples:
        analyzer = GrokAnalyzer(api_key="xai-...")
        signals  = await analyzer.live_search_health(county="Nairobi", disease="malaria")
        enriched = await analyzer.classify_signals(existing_signals)
    """

    def __init__(self, api_key: str = "", model: str = "grok-3-mini"):
        self.api_key = api_key
        self.model = model

    def is_available(self) -> bool:
        """Check if xAI API key is configured and aiohttp installed."""
        if not AIOHTTP_AVAILABLE:
            logger.warning("aiohttp not installed — Grok analyzer unavailable")
            return False
        if not self.api_key:
            logger.warning("XAI_API_KEY not configured in .env")
            return False
        return True

    # ─────────────────────────────────────────────────────────────────────────
    # Live search: find new content from X + web
    # ─────────────────────────────────────────────────────────────────────────

    async def live_search_health(
        self,
        county: Optional[str] = None,
        disease: Optional[str] = None,
        limit: int = 10,
    ) -> List[SocialSignal]:
        """
        Use Grok live search to find real-time health mentions on X/web.

        Does NOT require existing signals — Grok discovers them from scratch.
        Returns at most `limit` SocialSignal objects with data_source='grok_live'.
        """
        if not self.is_available():
            return []

        disease_name = DISEASE_NAMES.get(disease or "", disease or "disease outbreak")
        county_clause = f"in {county}, Kenya" if county else "in Kenya"
        query_hint = f"{disease_name} {county_clause}"

        system_prompt = (
            "You are a disease surveillance AI. Search for recent social media posts "
            "and news articles about health outbreaks in Kenya. Return structured JSON only."
        )
        user_prompt = (
            f"Find the 5 most recent and relevant posts or articles about '{query_hint}'. "
            f"Return a JSON array of objects with these exact keys:\n"
            f"  source_url, content (max 200 chars), county (Kenya county or 'Kenya'), "
            f"  disease (e.g. malaria), sentiment ('positive'|'negative'|'neutral'|'urgent'), "
            f"  is_official (true if from health org)\n"
            f"Return ONLY the JSON array, no prose."
        )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "search": {
                "mode": "on",
                "sources": [
                    {"type": "x"},
                    {"type": "web"},
                    {"type": "news"},
                ],
            },
            "temperature": 0.1,
            "max_tokens": 1500,
        }

        try:
            raw_results = await self._call_api(payload)
            if not raw_results:
                return []

            signals = []
            for item in raw_results[:limit]:
                signal = self._parse_search_result(item, county, disease)
                if signal:
                    signals.append(signal)

            logger.info(f"Grok live search: found {len(signals)} signals for '{query_hint}'")
            return signals

        except Exception as e:
            logger.error(f"Grok live_search_health failed: {e}")
            return []

    # ─────────────────────────────────────────────────────────────────────────
    # Signal classification: enrich existing signals with AI scoring
    # ─────────────────────────────────────────────────────────────────────────

    async def classify_signals(
        self, signals: List[SocialSignal], batch_size: int = 10
    ) -> List[SocialSignal]:
        """
        Send existing signals to Grok for AI-powered classification.
        Enriches ai_classification field with severity and confidence scores.

        Returns the same signals with updated ai_classification field.
        """
        if not self.is_available() or not signals:
            return signals

        enriched = []
        for batch_start in range(0, len(signals), batch_size):
            batch = signals[batch_start : batch_start + batch_size]
            try:
                batch_enriched = await self._classify_batch(batch)
                enriched.extend(batch_enriched)
            except Exception as e:
                logger.warning(f"Grok classify_signals batch failed: {e}")
                enriched.extend(batch)  # Return originals on failure

        return enriched

    async def _classify_batch(self, signals: List[SocialSignal]) -> List[SocialSignal]:
        """Classify a batch of signals and attach ai_classification metadata."""
        texts = [
            {"index": i, "county": s.location, "content": s.content[:200]}
            for i, s in enumerate(signals)
        ]

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a disease surveillance classifier. "
                        "Rate each post for severity and confidence. Return JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Classify these {len(texts)} health posts. "
                        f"Return a JSON array with: index, severity (0-100), "
                        f"confidence (0-1), disease_confirmed (bool), "
                        f"classification_notes (1 sentence).\n\n"
                        f"Posts:\n{json.dumps(texts, ensure_ascii=False)}"
                    ),
                },
            ],
            "temperature": 0.1,
            "max_tokens": 1000,
        }

        response = await self._call_api(payload)
        if not response or not isinstance(response, list):
            return signals

        # Merge classifications back into signals
        classifications = {item.get("index"): item for item in response if "index" in item}
        for i, signal in enumerate(signals):
            if i in classifications:
                cls = classifications[i]
                signal.ai_classification = {
                    "severity": cls.get("severity", 50),
                    "confidence": cls.get("confidence", 0.5),
                    "disease_confirmed": cls.get("disease_confirmed", False),
                    "notes": cls.get("classification_notes", ""),
                    "classified_by": "grok_xai",
                }
        return signals

    # ─────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────────────────────────────────────

    async def _call_api(self, payload: dict):
        """
        Make a request to the xAI API and parse the JSON content.
        Returns parsed list/dict from the assistant message, or None on error.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{XAI_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    logger.warning(f"xAI API error {resp.status}: {text[:300]}")
                    return None

                data = await resp.json()

        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        # Strip markdown code fences if present
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(
                line for line in lines
                if not line.startswith("```")
            ).strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            logger.warning(f"Grok returned non-JSON content: {content[:200]}")
            return None

    def _parse_search_result(
        self,
        item: dict,
        county: Optional[str] = None,
        disease: Optional[str] = None,
    ) -> Optional[SocialSignal]:
        """Convert a Grok search result dict to a SocialSignal."""
        try:
            content = (item.get("content") or "")[:500]
            if not content:
                return None

            # Normalize sentiment
            raw_sentiment = (item.get("sentiment") or "neutral").lower()
            sentiment_map = {
                "positive": SentimentEnum.POSITIVE,
                "negative": SentimentEnum.NEGATIVE,
                "neutral":  SentimentEnum.NEUTRAL,
                "urgent":   SentimentEnum.URGENT,
            }
            sentiment = sentiment_map.get(raw_sentiment, SentimentEnum.NEUTRAL)

            detected_county = item.get("county") or county or "Kenya"
            # Validate county is a known Kenyan county
            if detected_county not in KENYAN_COUNTIES:
                detected_county = county or "Kenya"

            detected_disease = item.get("disease") or disease
            url = item.get("source_url")
            is_official = bool(item.get("is_official", False))

            return SocialSignal(
                id=f"grok_{uuid4().hex[:12]}",
                signal_type="grok_search_result",
                content=content,
                sentiment=sentiment,
                location=detected_county,
                disease_mentioned=detected_disease,
                source="Grok xAI (Live Search)",
                timestamp=datetime.utcnow(),
                engagement_score=0.5,  # Unknown for search results
                platform_id=None,
                author_handle=None,
                url=url,
                is_verified_source=is_official,
                data_source="grok_live",
                ai_classification={
                    "classified_by": "grok_xai",
                    "confidence": 0.7,
                    "notes": "Discovered via Grok live search",
                },
            )

        except Exception as e:
            logger.warning(f"Failed to parse Grok search result: {e}")
            return None

    async def get_connection_status(self) -> dict:
        """Return connectivity status for the /status endpoint."""
        base = {
            "platform": "Grok xAI",
            "library": "aiohttp (OpenAI-compatible API)",
            "model": self.model,
            "installed": AIOHTTP_AVAILABLE,
            "credentials_configured": bool(self.api_key),
            "authenticated": False,
            "status": "not_configured",
        }

        if not self.is_available():
            return base

        # Lightweight ping — minimal token usage
        try:
            ping_payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": "ping"}],
                "max_tokens": 5,
            }
            result = await self._call_api(ping_payload)
            # If we get ANY response (including None from JSON parse), API is reachable
            base["authenticated"] = True
            base["status"] = "connected"
        except Exception as e:
            base["status"] = f"error: {str(e)[:80]}"

        return base
