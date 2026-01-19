"""
🎓 LEARNING: counties.py - Kenya Counties Router

Endpoints for Kenya's 47 counties and their disease statistics.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from app.models.county import County, CountyStats, CountyListResponse, RiskLevel

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Kenya Counties Data
# ═══════════════════════════════════════════════════════════════════════════════
# All 47 counties of Kenya with mock disease statistics

KENYA_COUNTIES = [
    {"id": "001", "name": "Mombasa", "code": "001", "population": 1208333, "region": "Coast"},
    {"id": "002", "name": "Kwale", "code": "002", "population": 866820, "region": "Coast"},
    {"id": "003", "name": "Kilifi", "code": "003", "population": 1453787, "region": "Coast"},
    {"id": "004", "name": "Tana River", "code": "004", "population": 315943, "region": "Coast"},
    {"id": "005", "name": "Lamu", "code": "005", "population": 143920, "region": "Coast"},
    {"id": "006", "name": "Taita-Taveta", "code": "006", "population": 340671, "region": "Coast"},
    {"id": "007", "name": "Garissa", "code": "007", "population": 841353, "region": "North Eastern"},
    {"id": "008", "name": "Wajir", "code": "008", "population": 781263, "region": "North Eastern"},
    {"id": "009", "name": "Mandera", "code": "009", "population": 867457, "region": "North Eastern"},
    {"id": "010", "name": "Marsabit", "code": "010", "population": 459785, "region": "Eastern"},
    {"id": "011", "name": "Isiolo", "code": "011", "population": 268002, "region": "Eastern"},
    {"id": "012", "name": "Meru", "code": "012", "population": 1545714, "region": "Eastern"},
    {"id": "013", "name": "Tharaka-Nithi", "code": "013", "population": 393177, "region": "Eastern"},
    {"id": "014", "name": "Embu", "code": "014", "population": 608599, "region": "Eastern"},
    {"id": "015", "name": "Kitui", "code": "015", "population": 1136187, "region": "Eastern"},
    {"id": "016", "name": "Machakos", "code": "016", "population": 1421932, "region": "Eastern"},
    {"id": "017", "name": "Makueni", "code": "017", "population": 987653, "region": "Eastern"},
    {"id": "018", "name": "Nyandarua", "code": "018", "population": 638289, "region": "Central"},
    {"id": "019", "name": "Nyeri", "code": "019", "population": 759164, "region": "Central"},
    {"id": "020", "name": "Kirinyaga", "code": "020", "population": 610411, "region": "Central"},
    {"id": "021", "name": "Murang'a", "code": "021", "population": 1056640, "region": "Central"},
    {"id": "022", "name": "Kiambu", "code": "022", "population": 2417735, "region": "Central"},
    {"id": "023", "name": "Turkana", "code": "023", "population": 926976, "region": "Rift Valley"},
    {"id": "024", "name": "West Pokot", "code": "024", "population": 621241, "region": "Rift Valley"},
    {"id": "025", "name": "Samburu", "code": "025", "population": 310327, "region": "Rift Valley"},
    {"id": "026", "name": "Trans-Nzoia", "code": "026", "population": 990341, "region": "Rift Valley"},
    {"id": "027", "name": "Uasin Gishu", "code": "027", "population": 1163186, "region": "Rift Valley"},
    {"id": "028", "name": "Elgeyo-Marakwet", "code": "028", "population": 454480, "region": "Rift Valley"},
    {"id": "029", "name": "Nandi", "code": "029", "population": 885711, "region": "Rift Valley"},
    {"id": "030", "name": "Baringo", "code": "030", "population": 666763, "region": "Rift Valley"},
    {"id": "031", "name": "Laikipia", "code": "031", "population": 518560, "region": "Rift Valley"},
    {"id": "032", "name": "Nakuru", "code": "032", "population": 2162202, "region": "Rift Valley"},
    {"id": "033", "name": "Narok", "code": "033", "population": 1157873, "region": "Rift Valley"},
    {"id": "034", "name": "Kajiado", "code": "034", "population": 1117840, "region": "Rift Valley"},
    {"id": "035", "name": "Kericho", "code": "035", "population": 901777, "region": "Rift Valley"},
    {"id": "036", "name": "Bomet", "code": "036", "population": 875689, "region": "Rift Valley"},
    {"id": "037", "name": "Kakamega", "code": "037", "population": 1867579, "region": "Western"},
    {"id": "038", "name": "Vihiga", "code": "038", "population": 590013, "region": "Western"},
    {"id": "039", "name": "Bungoma", "code": "039", "population": 1670570, "region": "Western"},
    {"id": "040", "name": "Busia", "code": "040", "population": 893681, "region": "Western"},
    {"id": "041", "name": "Siaya", "code": "041", "population": 993183, "region": "Nyanza"},
    {"id": "042", "name": "Kisumu", "code": "042", "population": 1155574, "region": "Nyanza"},
    {"id": "043", "name": "Homa Bay", "code": "043", "population": 1131950, "region": "Nyanza"},
    {"id": "044", "name": "Migori", "code": "044", "population": 1116436, "region": "Nyanza"},
    {"id": "045", "name": "Kisii", "code": "045", "population": 1266860, "region": "Nyanza"},
    {"id": "046", "name": "Nyamira", "code": "046", "population": 605576, "region": "Nyanza"},
    {"id": "047", "name": "Nairobi", "code": "047", "population": 4397073, "region": "Nairobi"},
]

# Mock county statistics
def get_mock_stats(county: dict) -> dict:
    """Generate mock disease stats for a county"""
    import random
    random.seed(hash(county["id"]))  # Consistent random per county
    
    cases = random.randint(10, 500)
    risk = "high" if cases > 300 else "medium" if cases > 100 else "low"
    
    return {
        "county_id": county["id"],
        "county_name": county["name"],
        "active_cases": cases,
        "risk_level": risk,
        "trend": f"+{random.randint(1, 15)}%" if random.random() > 0.4 else f"-{random.randint(1, 10)}%",
        "top_diseases": random.sample(["Malaria", "Cholera", "Dengue", "Typhoid"], 2),
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("", response_model=CountyListResponse)
async def list_counties(
    region: Optional[str] = Query(None, description="Filter by region"),
    risk_level: Optional[RiskLevel] = Query(None, description="Filter by risk level")
):
    """
    List all 47 Kenyan counties with disease statistics.
    
    🎓 LEARNING: Combining Data
    Here we combine county info with generated statistics.
    In production, this would come from the database.
    """
    result = []
    
    for county in KENYA_COUNTIES:
        # Apply region filter
        if region and county["region"].lower() != region.lower():
            continue
            
        stats = get_mock_stats(county)
        
        # Apply risk level filter
        if risk_level and stats["risk_level"] != risk_level.value:
            continue
            
        result.append(stats)
    
    # Sort by risk (high first)
    risk_order = {"high": 0, "medium": 1, "low": 2}
    result.sort(key=lambda x: risk_order[x["risk_level"]])
    
    return CountyListResponse(data=result, count=len(result))


@router.get("/{county_id}")
async def get_county(county_id: str):
    """Get detailed info for a specific county"""
    for county in KENYA_COUNTIES:
        if county["id"] == county_id or county["code"] == county_id:
            return {
                **county,
                "stats": get_mock_stats(county)
            }
    
    raise HTTPException(status_code=404, detail="County not found")


@router.get("/{county_id}/history")
async def get_county_history(
    county_id: str,
    days: int = Query(30, ge=7, le=365, description="Number of days of history")
):
    """
    Get historical disease data for a county.
    
    🎓 LEARNING: This would typically query time-series data
    from the database. For now, we return mock data.
    """
    # Verify county exists
    county = None
    for c in KENYA_COUNTIES:
        if c["id"] == county_id:
            county = c
            break
    
    if not county:
        raise HTTPException(status_code=404, detail="County not found")
    
    # Generate mock historical data
    import random
    from datetime import timedelta
    
    random.seed(hash(county_id))
    history = []
    base_cases = random.randint(50, 200)
    
    for i in range(days):
        date = datetime.utcnow() - timedelta(days=days - i)
        # Add some variation
        cases = max(0, base_cases + random.randint(-20, 20))
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "cases": cases
        })
    
    return {
        "county": county["name"],
        "period_days": days,
        "history": history
    }
