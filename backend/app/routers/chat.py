"""
Chat API Router

Provides endpoints for the AI chatbot functionality.
Integrates Ollama LLM with ML predictions and social media insights.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from app.services.ollama_service import get_ollama_service
from app.services.ml_service import MLModelManager
from app.models.training_data import PredictionRequest, DiseaseEnum

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
ml_manager = MLModelManager()


class ChatMessage(BaseModel):
    """Single chat message"""
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    """Chat request from frontend"""
    message: str
    county: Optional[str] = None
    disease: Optional[str] = None
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    """Chat response to frontend"""
    message: str
    sources: List[str] = []
    suggested_actions: List[str] = []
    audio_url: Optional[str] = None  # For ElevenLabs TTS


def build_context(county: Optional[str], disease: Optional[str]) -> str:
    """Build context string with ML predictions and social data"""
    context_parts = []
    
    # Add ML prediction if county and disease specified
    if county and disease:
        try:
            # Create a sample prediction request
            # In production, you'd fetch real environmental data
            request = PredictionRequest(
                county=county,
                disease=DiseaseEnum(disease.lower()),
                temperature=25.0,
                humidity=65.0,
                rainfall=80.0,
                population_density=1500.0,
                access_to_water=70.0,
                healthcare_coverage=60.0,
                previous_cases=50,
                vaccination_rate=45.0
            )
            
            prediction = ml_manager.predict(request)
            context_parts.append(f"""
## ML Prediction for {county} - {disease}
- Risk Level: {prediction.risk_level.value}
- Outbreak Probability: {prediction.outbreak_probability * 100:.1f}%
- Predicted Cases: {prediction.predicted_cases}
- Confidence: {prediction.confidence_score * 100:.1f}%
- Model Version: {prediction.model_version}
""")
        except Exception as e:
            logger.warning(f"Could not get ML prediction: {e}")
            context_parts.append(f"(ML prediction unavailable for {county}/{disease})")
    
    # Add mock social media data
    # In production, this would call the social media service
    if county:
        context_parts.append(f"""
## Social Media Signals for {county}
- Total mentions (24h): {150 + hash(county) % 200}
- Sentiment: Concerned
- Top keywords: fever, clinic, outbreak
- Sample post: "Many people sick in our area, hospitals are busy"
""")
    
    # Add current date context
    from datetime import datetime
    context_parts.append(f"\n## Current Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    return "\n".join(context_parts)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Processes user message, enriches with context, and returns AI response
    """
    try:
        ollama = get_ollama_service()
        
        # Build context based on conversation
        context = build_context(request.county, request.disease)
        
        # Add conversation history to context
        if request.history:
            history_text = "\n".join([
                f"{msg.role.upper()}: {msg.content}" 
                for msg in request.history[-5:]  # Last 5 messages
            ])
            context = f"## Recent Conversation\n{history_text}\n\n{context}"
        
        # Generate response
        response_text = await ollama.generate(
            prompt=request.message,
            context=context,
            temperature=0.7
        )
        
        # Extract suggested actions from response
        suggested_actions = []
        if "recommend" in response_text.lower() or "should" in response_text.lower():
            # Simple extraction - in production, use structured output
            lines = response_text.split('\n')
            for line in lines:
                if any(marker in line for marker in ['1.', '2.', '3.', '•', '-', '✅', '⚠️', '🔍']):
                    if len(line.strip()) > 10:
                        suggested_actions.append(line.strip()[:100])
        
        return ChatResponse(
            message=response_text,
            sources=["ML Prediction Model", "Social Media Analysis", "DHIS2 Historical Data"],
            suggested_actions=suggested_actions[:5],
            audio_url=None  # TODO: ElevenLabs integration
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/status")
async def chat_status():
    """Check AI service availability"""
    ollama = get_ollama_service()
    is_available = await ollama.check_availability()
    
    return {
        "ollama_available": is_available,
        "model": ollama.model,
        "fallback_active": not is_available,
        "ml_models_loaded": len(ml_manager.models) > 0
    }
