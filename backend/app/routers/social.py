"""
Social Media Signals API Router
Provides structured social media surveillance data for disease monitoring.
"""
from fastapi import APIRouter
from app.models.social import SocialSignalResponse, SocialSignal, SentimentScore
from app.services.social_harvester import SocialHarvester
from typing import Optional

router = APIRouter(prefix="/api/v1/social", tags=["Social Signals"])


@router.get("/signals", response_model=SocialSignalResponse)
async def get_social_signals(
    county: Optional[str] = None,
    disease: Optional[str] = None,
    limit: int = 20
):
    """
    Fetch social media signals relevant to disease surveillance.
    Optionally filter by county or disease.
    """
    harvester = SocialHarvester()
    signals = harvester.get_signals(county=county, disease=disease, limit=limit)
    sentiment = harvester.get_aggregate_sentiment(signals)

    return SocialSignalResponse(
        signals=signals,
        total_count=len(signals),
        aggregate_sentiment=sentiment,
        sources=["Twitter/X", "Facebook Health Groups", "Community Reports"],
    )
