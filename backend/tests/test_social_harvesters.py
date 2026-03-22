"""
Tests for Social Media Harvesters
===================================
Tests the Twitter harvester, social harvester orchestrator,
and updated social API endpoints.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.models.social import SocialSignal, SentimentEnum, SocialSignalResponse
from app.services.social_harvester import SocialHarvester


client = TestClient(app)


# ═══════════════════════════════════════════════════════════════════════════════
# Model Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestSocialSignalModel:
    """Test the enhanced SocialSignal model."""

    def test_signal_with_provenance_fields(self):
        """New provenance fields should serialize correctly."""
        signal = SocialSignal(
            id="tw_123456",
            signal_type="tweet",
            content="Malaria cases rising in Nairobi",
            sentiment=SentimentEnum.NEGATIVE,
            location="Nairobi",
            disease_mentioned="malaria",
            source="Twitter/X",
            timestamp=datetime.utcnow(),
            engagement_score=0.45,
            platform_id="123456",
            author_handle="@health_ke",
            url="https://x.com/i/status/123456",
            is_verified_source=True,
            data_source="twitter_live",
        )
        data = signal.model_dump()
        assert data["platform_id"] == "123456"
        assert data["author_handle"] == "@health_ke"
        assert data["data_source"] == "twitter_live"
        assert data["is_verified_source"] is True

    def test_signal_default_mock_source(self):
        """Default data_source should be 'mock'."""
        signal = SocialSignal(
            id="mock_001",
            signal_type="tweet",
            content="Test content",
            sentiment=SentimentEnum.NEUTRAL,
            source="Twitter/X",
            timestamp=datetime.utcnow(),
        )
        assert signal.data_source == "mock"
        assert signal.is_verified_source is False
        assert signal.platform_id is None


# ═══════════════════════════════════════════════════════════════════════════════
# Social Harvester Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestSocialHarvester:
    """Test the SocialHarvester orchestrator."""

    def test_mock_mode_returns_signals(self):
        """Mock mode should always return signals."""
        harvester = SocialHarvester(mode="mock")
        signals = harvester.get_signals(limit=10)
        assert len(signals) > 0
        assert all(s.data_source == "mock" for s in signals)

    def test_mock_mode_county_filter(self):
        """Mock mode should respect county filter."""
        harvester = SocialHarvester(mode="mock")
        signals = harvester.get_signals(county="Nairobi", limit=5)
        assert len(signals) > 0
        assert all(s.location == "Nairobi" for s in signals)

    def test_mock_mode_disease_filter(self):
        """Mock mode should respect disease filter."""
        harvester = SocialHarvester(mode="mock")
        signals = harvester.get_signals(disease="malaria", limit=5)
        assert len(signals) > 0
        assert all(s.disease_mentioned == "malaria" for s in signals)

    def test_aggregate_sentiment(self):
        """Sentiment aggregation should produce valid scores."""
        harvester = SocialHarvester(mode="mock")
        signals = harvester.get_signals(limit=10)
        sentiment = harvester.get_aggregate_sentiment(signals)
        total = sentiment.positive + sentiment.negative + sentiment.neutral + sentiment.urgent
        assert abs(total - 1.0) < 0.01  # Should sum to ~1.0

    def test_empty_signals_sentiment(self):
        """Empty signal list should return neutral sentiment."""
        harvester = SocialHarvester(mode="mock")
        sentiment = harvester.get_aggregate_sentiment([])
        assert sentiment.overall_label == SentimentEnum.NEUTRAL

    @pytest.mark.asyncio
    async def test_hybrid_mode_fallback(self):
        """Hybrid mode should fallback to mock when Twitter unavailable."""
        harvester = SocialHarvester(mode="hybrid")
        signals = await harvester.get_signals_async(limit=10)
        assert len(signals) > 0

    @pytest.mark.asyncio
    async def test_get_status(self):
        """Status endpoint should return structured status."""
        harvester = SocialHarvester(mode="hybrid")
        status = await harvester.get_status()
        assert "harvest_mode" in status
        assert "twitter" in status
        assert "overall_status" in status

    @pytest.mark.asyncio
    async def test_harvest_all(self):
        """Harvest all should return results dict."""
        harvester = SocialHarvester(mode="mock")
        result = await harvester.harvest_all(limit=5)
        assert result["success"] is True
        assert result["signals_collected"] > 0
        assert isinstance(result["sources_queried"], list)


# ═══════════════════════════════════════════════════════════════════════════════
# API Endpoint Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestSocialEndpoints:
    """Test the social signals API endpoints."""

    def test_get_signals(self):
        """GET /api/v1/social/signals should return signals."""
        response = client.get("/api/v1/social/signals")
        assert response.status_code == 200
        data = response.json()
        assert "signals" in data
        assert "total_count" in data
        assert "aggregate_sentiment" in data
        assert "harvest_mode" in data

    def test_get_signals_with_county(self):
        """GET /api/v1/social/signals?county=Nairobi should filter."""
        response = client.get("/api/v1/social/signals?county=Nairobi")
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] > 0

    def test_get_signals_with_limit(self):
        """GET /api/v1/social/signals?limit=5 should respect limit."""
        response = client.get("/api/v1/social/signals?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] <= 5

    def test_get_status(self):
        """GET /api/v1/social/status should return connection info."""
        response = client.get("/api/v1/social/status")
        assert response.status_code == 200
        data = response.json()
        assert "twitter" in data
        assert "harvest_mode" in data
        assert "overall_status" in data

    def test_trigger_harvest(self):
        """POST /api/v1/social/harvest should trigger collection."""
        response = client.post("/api/v1/social/harvest")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "signals_collected" in data
        assert "sources_queried" in data
        assert "message" in data


# ═══════════════════════════════════════════════════════════════════════════════
# Twitter Harvester Unit Tests (mocked)
# ═══════════════════════════════════════════════════════════════════════════════

class TestTwitterHarvester:
    """Test the Twitter harvester with mocked twikit."""

    def test_is_available_without_credentials(self):
        """Should return False when no credentials configured."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester(username="", email="", password="")
        assert harvester.is_available() is False

    def test_is_available_with_credentials(self):
        """Should return True when credentials are set (if twikit installed)."""
        from app.services.twitter_harvester import TwitterHarvester, TWIKIT_AVAILABLE
        harvester = TwitterHarvester(
            username="testuser",
            email="test@test.com",
            password="pass123"
        )
        assert harvester.is_available() == TWIKIT_AVAILABLE

    def test_build_query_disease(self):
        """Should build correct search query for disease."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester()
        query = harvester._build_query(disease="malaria", county="Nairobi")
        assert "malaria" in query.lower()
        assert "Nairobi" in query
        assert "Kenya" in query

    def test_build_query_generic(self):
        """Should build generic health query when no disease specified."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester()
        query = harvester._build_query()
        assert "Kenya" in query
        assert "malaria" in query.lower() or "cholera" in query.lower()

    def test_detect_disease(self):
        """Should detect disease from tweet content."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester()
        assert harvester._detect_disease("Malaria cases rising in Nairobi") == "malaria"
        assert harvester._detect_disease("Cholera outbreak reported") == "cholera"
        assert harvester._detect_disease("Nice weather today") is None

    def test_detect_county(self):
        """Should detect county from tweet content."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester()
        assert harvester._detect_county("Cases rising in Nairobi city") == "Nairobi"
        assert harvester._detect_county("Mombasa health alert") == "Mombasa"
        assert harvester._detect_county("Some random text") is None

    def test_analyze_sentiment(self):
        """Should classify sentiment correctly."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester()
        assert harvester._analyze_sentiment(
            "URGENT: Emergency outbreak crisis!"
        ) == SentimentEnum.URGENT
        assert harvester._analyze_sentiment(
            "Cases rising, people sick and spreading"
        ) == SentimentEnum.NEGATIVE
        assert harvester._analyze_sentiment(
            "Cases declining, vaccine working, recovered patients"
        ) == SentimentEnum.POSITIVE

    @pytest.mark.asyncio
    async def test_connection_status_not_configured(self):
        """Status should report not_configured when no credentials."""
        from app.services.twitter_harvester import TwitterHarvester
        harvester = TwitterHarvester(username="", email="", password="")
        status = await harvester.get_connection_status()
        assert status["status"] == "not_configured"
        assert status["platform"] == "Twitter/X"


# ═══════════════════════════════════════════════════════════════════════════════
# Facebook Harvester Unit Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestFacebookHarvester:
    """Test the Facebook harvester without making real API calls."""

    def test_is_available_without_token(self):
        """Should return False when no access token configured."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="")
        assert harvester.is_available() is False

    def test_is_available_with_token(self):
        """Should return True when token is set (and aiohttp installed)."""
        from app.services.facebook_harvester import FacebookHarvester, AIOHTTP_AVAILABLE
        harvester = FacebookHarvester(access_token="fake_token_123")
        assert harvester.is_available() == AIOHTTP_AVAILABLE

    def test_default_pages_loaded(self):
        """Should load default Kenya health pages when no page_ids given."""
        from app.services.facebook_harvester import FacebookHarvester, DEFAULT_HEALTH_PAGES
        harvester = FacebookHarvester(access_token="tok")
        assert len(harvester._pages) == len(DEFAULT_HEALTH_PAGES)

    def test_custom_pages_parsed(self):
        """Comma-separated page_ids should be parsed correctly."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="tok", page_ids="MOH,WHO,UNICEF")
        assert len(harvester._pages) == 3
        assert harvester._pages[0]["id"] == "MOH"

    def test_parse_fb_post_valid(self):
        """A valid Graph API post dict should produce a SocialSignal."""
        from app.services.facebook_harvester import FacebookHarvester
        from app.models.social import SocialSignal
        harvester = FacebookHarvester(access_token="tok")
        post = {
            "id": "12345",
            "message": "Malaria cases rising in Nairobi. @MOH_Kenya alert issued.",
            "created_time": "2026-03-22T00:00:00+0000",
            "permalink_url": "https://www.facebook.com/permalink/12345",
            "reactions": {"summary": {"total_count": 120}},
        }
        signal = harvester._parse_fb_post(post, "Kenya Ministry of Health")
        assert signal is not None
        assert isinstance(signal, SocialSignal)
        assert signal.data_source == "facebook_live"
        assert signal.is_verified_source is True
        assert signal.platform_id == "12345"

    def test_parse_fb_post_no_message(self):
        """Post with no message should return None."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="tok")
        signal = harvester._parse_fb_post({"id": "1", "message": None}, "Test Page")
        assert signal is None

    def test_detect_disease(self):
        """Should detect disease from Facebook post content."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="tok")
        assert harvester._detect_disease("Cholera outbreak in Mombasa") == "cholera"
        assert harvester._detect_disease("Typhoid cases confirmed") == "typhoid"
        assert harvester._detect_disease("Community clean-up drive today") is None

    def test_detect_county(self):
        """Should detect Kenyan county from post content."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="tok")
        assert harvester._detect_county("Flooding in Nakuru county") == "Nakuru"
        assert harvester._detect_county("Random news") is None

    def test_analyze_sentiment_urgent(self):
        """Should classify urgent sentiment for emergency language."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="tok")
        result = harvester._analyze_sentiment("Cholera outbreak emergency alert")
        assert result == SentimentEnum.URGENT

    def test_is_health_relevant(self):
        """Health keyword filter should include/exclude correctly."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="tok")
        assert harvester._is_health_relevant("Malaria outbreak detected") is True
        assert harvester._is_health_relevant("Football match results today") is False

    @pytest.mark.asyncio
    async def test_connection_status_not_configured(self):
        """Status should report not_configured when no token."""
        from app.services.facebook_harvester import FacebookHarvester
        harvester = FacebookHarvester(access_token="")
        status = await harvester.get_connection_status()
        assert status["platform"] == "Facebook"
        assert status["status"] == "not_configured"
        assert status["authenticated"] is False


# ═══════════════════════════════════════════════════════════════════════════════
# Grok xAI Analyzer Unit Tests
# ═══════════════════════════════════════════════════════════════════════════════

class TestGrokAnalyzer:
    """Test the Grok xAI analyzer without making real API calls."""

    def test_is_available_without_key(self):
        """Should return False when no API key configured."""
        from app.services.grok_analyzer import GrokAnalyzer
        analyzer = GrokAnalyzer(api_key="")
        assert analyzer.is_available() is False

    def test_is_available_with_key(self):
        """Should return True when API key is set (and aiohttp installed)."""
        from app.services.grok_analyzer import GrokAnalyzer, AIOHTTP_AVAILABLE
        analyzer = GrokAnalyzer(api_key="xai-fake-key-123")
        assert analyzer.is_available() == AIOHTTP_AVAILABLE

    def test_parse_search_result_valid(self):
        """Valid search result dict should produce a SocialSignal."""
        from app.services.grok_analyzer import GrokAnalyzer
        analyzer = GrokAnalyzer(api_key="xai-test")
        result = {
            "content": "Health officials warn of malaria surge in Kisumu after heavy rains.",
            "sentiment": "urgent",
            "county": "Kisumu",
            "disease": "malaria",
            "source_url": "https://x.com/healthke/status/12345",
            "is_official": True,
        }
        signal = analyzer._parse_search_result(result, county="Kisumu", disease="malaria")
        assert signal is not None
        assert signal.data_source == "grok_live"
        assert signal.sentiment == SentimentEnum.URGENT
        assert signal.location == "Kisumu"
        assert signal.is_verified_source is True
        assert signal.ai_classification is not None

    def test_parse_search_result_empty_content(self):
        """Result with no content should return None."""
        from app.services.grok_analyzer import GrokAnalyzer
        analyzer = GrokAnalyzer(api_key="xai-test")
        signal = analyzer._parse_search_result({"content": ""})
        assert signal is None

    def test_parse_search_result_unknown_county(self):
        """County not in Kenya list should default to provided county filter."""
        from app.services.grok_analyzer import GrokAnalyzer
        analyzer = GrokAnalyzer(api_key="xai-test")
        result = {"content": "Health alert issued.", "county": "NotACounty", "sentiment": "negative"}
        signal = analyzer._parse_search_result(result, county="Mombasa")
        assert signal.location == "Mombasa"

    def test_parse_search_result_sentiment_mapping(self):
        """All sentiment values should map to the correct SentimentEnum."""
        from app.services.grok_analyzer import GrokAnalyzer
        analyzer = GrokAnalyzer(api_key="xai-test")
        for raw, expected in [
            ("positive", SentimentEnum.POSITIVE),
            ("negative", SentimentEnum.NEGATIVE),
            ("neutral",  SentimentEnum.NEUTRAL),
            ("urgent",   SentimentEnum.URGENT),
            ("unknown",  SentimentEnum.NEUTRAL),
        ]:
            result = {"content": "Some health news.", "sentiment": raw}
            signal = analyzer._parse_search_result(result)
            assert signal.sentiment == expected, f"Failed for sentiment={raw!r}"

    @pytest.mark.asyncio
    async def test_classify_signals_no_key_returns_originals(self):
        """classify_signals with no key should return signals unchanged."""
        from app.services.grok_analyzer import GrokAnalyzer
        from app.services.social_harvester import SocialHarvester
        analyzer = GrokAnalyzer(api_key="")
        harvester = SocialHarvester(mode="mock")
        signals = harvester.get_signals(limit=3)
        result = await analyzer.classify_signals(signals)
        assert result == signals

    @pytest.mark.asyncio
    async def test_connection_status_not_configured(self):
        """Status should report not_configured when no API key."""
        from app.services.grok_analyzer import GrokAnalyzer
        analyzer = GrokAnalyzer(api_key="")
        status = await analyzer.get_connection_status()
        assert status["platform"] == "Grok xAI"
        assert status["status"] == "not_configured"
        assert status["authenticated"] is False


# ═══════════════════════════════════════════════════════════════════════════════
# Multi-Source Orchestrator Tests (3 platforms)
# ═══════════════════════════════════════════════════════════════════════════════

class TestOrchestratorMultiSource:
    """Test SocialHarvester with all three Phase 2 sources integrated."""

    @pytest.mark.asyncio
    async def test_status_has_all_three_platforms(self):
        """Status dict must include twitter, facebook, and grok keys."""
        harvester = SocialHarvester(mode="hybrid")
        status = await harvester.get_status()
        assert "twitter"  in status
        assert "facebook" in status
        assert "grok"     in status
        assert "harvest_mode" in status
        assert "overall_status" in status

    @pytest.mark.asyncio
    async def test_hybrid_mode_mock_fallback_with_no_credentials(self):
        """With no API keys set, hybrid mode falls back to mock signals."""
        harvester = SocialHarvester(mode="hybrid")
        signals = await harvester.get_signals_async(limit=5)
        assert len(signals) > 0
        assert all(s.data_source == "mock" for s in signals)

    @pytest.mark.asyncio
    async def test_harvest_all_structured_result(self):
        """harvest_all should return dict with success, signals, sources, errors."""
        harvester = SocialHarvester(mode="mock")
        result = await harvester.harvest_all(limit=5)
        assert result["success"] is True
        assert result["signals_collected"] > 0
        assert isinstance(result["sources_queried"], list)
        assert isinstance(result["errors"], list)

    def test_facebook_attr_present(self):
        """_facebook attribute must exist on harvester (None OK if unconfigured)."""
        harvester = SocialHarvester(mode="hybrid")
        assert hasattr(harvester, "_facebook")

    def test_grok_attr_present(self):
        """_grok attribute must exist on harvester (None OK if unconfigured)."""
        harvester = SocialHarvester(mode="hybrid")
        assert hasattr(harvester, "_grok")

    def test_mock_mode_skips_all_source_inits(self):
        """In mock mode, none of the real harvesters should be initialized."""
        harvester = SocialHarvester(mode="mock")
        assert harvester._twitter is None
        assert harvester._facebook is None
        assert harvester._grok is None
