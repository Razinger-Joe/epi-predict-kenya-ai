"""
Pydantic models for Social Media Signals.
Enhanced with provenance fields for real data sources.
"""
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime


class SentimentEnum(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    URGENT = "urgent"


class SocialSignal(BaseModel):
    """A single social media signal relevant to disease surveillance."""
    id: str
    signal_type: str  # "tweet", "community_report", "news_article"
    content: str
    sentiment: SentimentEnum
    location: Optional[str] = None
    disease_mentioned: Optional[str] = None
    source: str  # "Twitter/X", "Facebook", "Community"
    timestamp: datetime
    engagement_score: float = 0.0  # likes + shares normalized

    # ── Real data provenance fields ──────────────────────────────────────────
    platform_id: Optional[str] = None       # Original post ID on platform
    author_handle: Optional[str] = None     # @username (for attribution)
    url: Optional[str] = None               # Link to original post
    is_verified_source: bool = False         # From verified health account
    data_source: str = "mock"               # "twitter_live", "mock"


class SentimentScore(BaseModel):
    """Aggregate sentiment score for a set of signals."""
    positive: float = 0.0
    negative: float = 0.0
    neutral: float = 0.0
    urgent: float = 0.0
    overall_label: SentimentEnum = SentimentEnum.NEUTRAL


class SocialSignalResponse(BaseModel):
    """Response model for the /social/signals endpoint."""
    signals: List[SocialSignal]
    total_count: int
    aggregate_sentiment: SentimentScore
    sources: List[str]
    harvest_mode: str = "mock"  # Indicate which mode produced this data


class HarvestStatusResponse(BaseModel):
    """Response model for the /social/status endpoint."""
    twitter: dict = {}
    harvest_mode: str = "mock"
    overall_status: str = "offline"


class HarvestTriggerResponse(BaseModel):
    """Response model for the /social/harvest endpoint."""
    success: bool
    signals_collected: int
    sources_queried: List[str]
    errors: List[str] = []
    message: str
