"""
Social Media Signals API Router
================================
Provides real + mock social media surveillance data for disease monitoring.
Endpoints:
  GET  /api/v1/social/signals  — Fetch social signals (filterable)
  GET  /api/v1/social/status   — Check harvester connection status
  POST /api/v1/social/harvest  — Trigger manual harvest run
"""
from fastapi import APIRouter, Query
from app.models.social import (
    SocialSignalResponse,
    HarvestStatusResponse,
    HarvestTriggerResponse,
)
from app.services.social_harvester import SocialHarvester
from typing import Optional

router = APIRouter(prefix="/api/v1/social", tags=["Social Signals"])


@router.get("/signals", response_model=SocialSignalResponse)
async def get_social_signals(
    county: Optional[str] = None,
    disease: Optional[str] = None,
    source: Optional[str] = Query(None, description="Filter by source: 'twitter_live' or 'mock'"),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Fetch social media signals relevant to disease surveillance.
    In hybrid mode, tries real Twitter/X data first, falls back to mock.
    """
    harvester = SocialHarvester()

    # Use async method for real data fetching
    signals = await harvester.get_signals_async(
        county=county, disease=disease, limit=limit, source=source
    )

    # Filter by source if specified
    if source:
        signals = [s for s in signals if s.data_source == source]

    sentiment = harvester.get_aggregate_sentiment(signals)

    # Determine which sources produced data
    active_sources = list(set(s.data_source for s in signals)) if signals else ["none"]

    return SocialSignalResponse(
        signals=signals,
        total_count=len(signals),
        aggregate_sentiment=sentiment,
        sources=active_sources,
        harvest_mode=harvester.mode,
    )


@router.get("/status", response_model=HarvestStatusResponse)
async def get_harvest_status():
    """
    Check the connection status of all social media data sources.
    Returns whether each source is connected, configured, or offline.
    """
    harvester = SocialHarvester()
    status = await harvester.get_status()

    return HarvestStatusResponse(
        twitter=status.get("twitter", {}),
        facebook=status.get("facebook", {}),
        grok=status.get("grok", {}),
        harvest_mode=status.get("harvest_mode", "mock"),
        overall_status=status.get("overall_status", "offline"),
    )


@router.post("/harvest", response_model=HarvestTriggerResponse)
async def trigger_harvest(
    county: Optional[str] = None,
    disease: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
):
    """
    Trigger a manual harvest run across all configured sources.
    Returns collection results including signal count and any errors.
    """
    harvester = SocialHarvester()
    result = await harvester.harvest_all(
        county=county, disease=disease, limit=limit
    )

    return HarvestTriggerResponse(
        success=result["success"],
        signals_collected=result["signals_collected"],
        sources_queried=result["sources_queried"],
        errors=result["errors"],
        message=result["message"],
    )
