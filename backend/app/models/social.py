"""
Pydantic models for Social Media Signals.
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
