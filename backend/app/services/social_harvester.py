"""
Social Media Harvester Service
==============================
Simulated social media insights harvester for disease surveillance.
Parses PDF reports from verified health operators and extracts health insights.
"""

import random
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

# Try importing PyMuPDF for PDF parsing (optional dependency)
try:
    import fitz  # PyMuPDF
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("⚠️ PyMuPDF not installed. PDF parsing will use mock data.")


# Disease-related keywords for content analysis
DISEASE_KEYWORDS = {
    "malaria": ["malaria", "mosquito", "fever", "chills", "sweating", "antimalarial"],
    "cholera": ["cholera", "diarrhea", "vomiting", "dehydration", "contaminated water"],
    "typhoid": ["typhoid", "salmonella", "high fever", "weakness", "stomach pain"],
    "dengue": ["dengue", "mosquito", "rash", "joint pain", "hemorrhagic"],
    "rift_valley_fever": ["rift valley", "rvf", "livestock", "hemorrhagic", "mosquito"],
    "flu": ["flu", "influenza", "cough", "sore throat", "respiratory"]
}

# 10 Featured Counties
FEATURED_COUNTIES = [
    # Major Cities
    {"name": "Nairobi", "region": "Central", "population": 4397073},
    {"name": "Mombasa", "region": "Coast", "population": 1208333},
    {"name": "Kisumu", "region": "Nyanza", "population": 1155574},
    {"name": "Nakuru", "region": "Rift Valley", "population": 2162202},
    # Spread Counties
    {"name": "Kisii", "region": "Nyanza", "population": 1266860},
    {"name": "Turkana", "region": "Rift Valley", "population": 926976},
    {"name": "West Pokot", "region": "Rift Valley", "population": 621241},
    {"name": "Garissa", "region": "North Eastern", "population": 841353},
    {"name": "Kakamega", "region": "Western", "population": 1867579},
    {"name": "Nyeri", "region": "Central", "population": 759164}
]


async def simulate_harvest() -> List[dict]:
    """
    Simulate harvesting social media health insights.
    Returns mock data representing social media posts about health conditions.
    """
    insights = []
    
    # Generate 5-10 random insights
    num_insights = random.randint(5, 10)
    
    platforms = ["Twitter/X", "Facebook", "WhatsApp Groups", "Reddit", "Local Forums"]
    sentiments = ["concerned", "alarmed", "informative", "urgent", "routine"]
    
    for i in range(num_insights):
        county = random.choice(FEATURED_COUNTIES)
        disease = random.choice(list(DISEASE_KEYWORDS.keys()))
        
        insight = {
            "id": str(uuid4()),
            "source": random.choice(platforms),
            "content": generate_mock_content(disease, county["name"]),
            "county": county["name"],
            "region": county["region"],
            "disease_indicators": [disease],
            "sentiment": random.choice(sentiments),
            "severity_score": random.randint(30, 95),
            "confidence": round(random.uniform(0.6, 0.95), 2),
            "status": "pending",
            "harvested_at": datetime.utcnow().isoformat(),
            "verified_by": None,
            "verified_at": None
        }
        insights.append(insight)
    
    return insights


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


async def parse_pdf_report(file_content: bytes, filename: str) -> dict:
    """
    Parse a PDF report uploaded by a verified health operator.
    Extracts text and analyzes for disease indicators.
    """
    extracted_text = ""
    
    if PDF_SUPPORT:
        try:
            # Open PDF from bytes
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text()
            doc.close()
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            extracted_text = f"[Error parsing PDF: {str(e)}]"
    else:
        # Mock extraction when PyMuPDF not available
        extracted_text = generate_mock_pdf_content()
    
    # Analyze extracted content
    analysis = analyze_content(extracted_text)
    
    return {
        "filename": filename,
        "extracted_text": extracted_text[:2000],  # Limit for storage
        "word_count": len(extracted_text.split()),
        "disease_indicators": analysis["disease_indicators"],
        "severity_score": analysis["severity_score"],
        "counties_mentioned": analysis["counties_mentioned"],
        "parsed_at": datetime.utcnow().isoformat()
    }


def generate_mock_pdf_content() -> str:
    """Generate mock PDF content for testing."""
    return """
    HEALTH SURVEILLANCE REPORT
    ==========================
    
    Region: Coastal Kenya
    Period: January 2026
    
    Summary:
    This report summarizes social media sentiment analysis regarding disease 
    outbreaks in Mombasa and surrounding areas.
    
    Key Findings:
    1. Increased mentions of malaria symptoms in Likoni and Changamwe
    2. Cholera concerns raised in areas with poor sanitation
    3. Dengue fever cases reported near port areas
    
    Disease Indicators:
    - Malaria: 45 mentions (High severity)
    - Cholera: 28 mentions (Medium severity)
    - Dengue: 12 mentions (Low severity)
    
    Recommendations:
    - Increase mosquito net distribution
    - Improve water treatment in affected areas
    - Conduct health education campaigns
    
    Verified by: Dr. [Operator Name]
    Date: February 2026
    """


def analyze_content(text: str) -> dict:
    """
    Analyze text content for disease indicators and severity.
    """
    text_lower = text.lower()
    
    # Find disease mentions
    found_diseases = []
    for disease, keywords in DISEASE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                if disease not in found_diseases:
                    found_diseases.append(disease)
                break
    
    # Find county mentions
    found_counties = []
    for county in FEATURED_COUNTIES:
        if county["name"].lower() in text_lower:
            found_counties.append(county["name"])
    
    # Calculate severity based on content analysis
    severity_indicators = ["urgent", "critical", "outbreak", "emergency", "surge", "alarming"]
    severity_count = sum(1 for word in severity_indicators if word in text_lower)
    base_severity = 40 + (severity_count * 10) + (len(found_diseases) * 5)
    severity_score = min(95, max(20, base_severity))
    
    return {
        "disease_indicators": found_diseases if found_diseases else ["unknown"],
        "counties_mentioned": found_counties if found_counties else ["unspecified"],
        "severity_score": severity_score
    }


async def get_analysis_status(insight_id: str) -> dict:
    """Get the current analysis status of an insight."""
    # In production, this would query the database
    statuses = ["pending", "analyzing", "analyzed", "verified"]
    return {
        "insight_id": insight_id,
        "status": random.choice(statuses),
        "progress": random.randint(0, 100),
        "updated_at": datetime.utcnow().isoformat()
    }


def get_featured_counties() -> List[dict]:
    """Return the list of 10 featured counties."""
    return FEATURED_COUNTIES
