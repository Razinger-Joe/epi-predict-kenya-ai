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
