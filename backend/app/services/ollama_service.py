"""
Ollama AI Service

Provides integration with Ollama for local LLM inference using Qwen model.
Falls back to mock responses if Ollama is not available.
"""

import httpx
import logging
from typing import Optional, Dict, List, AsyncGenerator
import json

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen:7b"  # Can be changed to qwen2:7b, llama3, etc.


class OllamaService:
    """Service for interacting with Ollama local LLM"""
    
    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = DEFAULT_MODEL):
        self.base_url = base_url
        self.model = model
        self._client = httpx.AsyncClient(timeout=120.0)
        self._is_available: Optional[bool] = None
    
    async def check_availability(self) -> bool:
        """Check if Ollama server is running"""
        try:
            response = await self._client.get(f"{self.base_url}/api/tags")
            self._is_available = response.status_code == 200
            return self._is_available
        except Exception as e:
            logger.warning(f"Ollama not available: {e}")
            self._is_available = False
            return False
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """
        Generate a response from the LLM
        
        Args:
            prompt: User's question/prompt
            system_prompt: System instructions for the model
            context: Additional context (ML predictions, social data, etc.)
            temperature: Creativity (0.0 = deterministic, 1.0 = creative)
            max_tokens: Maximum response length
            
        Returns:
            Generated text response
        """
        # Check availability
        if self._is_available is None:
            await self.check_availability()
        
        if not self._is_available:
            return self._generate_mock_response(prompt)
        
        # Build full prompt
        full_prompt = self._build_prompt(prompt, system_prompt, context)
        
        try:
            response = await self._client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    },
                    "stream": False,
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                logger.error(f"Ollama error: {response.status_code}")
                return self._generate_mock_response(prompt)
                
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return self._generate_mock_response(prompt)
    
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens for real-time UI updates"""
        
        if self._is_available is None:
            await self.check_availability()
        
        if not self._is_available:
            # Simulate streaming for mock
            mock_response = self._generate_mock_response(prompt)
            for word in mock_response.split():
                yield word + " "
            return
        
        full_prompt = self._build_prompt(prompt, system_prompt, context)
        
        async with self._client.stream(
            "POST",
            f"{self.base_url}/api/generate",
            json={
                "model": self.model,
                "prompt": full_prompt,
                "stream": True,
            }
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if chunk := data.get("response"):
                            yield chunk
                    except json.JSONDecodeError:
                        continue
    
    def _build_prompt(
        self,
        user_prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[str] = None
    ) -> str:
        """Build the full prompt with system instructions and context"""
        
        default_system = """You are EpiBot, an AI assistant for Kenya's disease surveillance system.
You help health officers understand disease outbreak risks, analyze trends, and make informed decisions.
You have access to:
1. ML-powered outbreak predictions for all 47 Kenyan counties
2. Social media early warning signals
3. Historical disease data

Be concise, professional, and actionable. Use emojis sparingly for emphasis.
When discussing risks, always mention:
- The specific county and disease
- Risk level (Low/Medium/High/Critical)
- Recommended actions
- Data sources used

Respond in English but understand Swahili queries."""

        parts = []
        parts.append(f"### System Instructions\n{system_prompt or default_system}")
        
        if context:
            parts.append(f"\n### Current Context & Data\n{context}")
        
        parts.append(f"\n### User Query\n{user_prompt}")
        parts.append("\n### Response")
        
        return "\n".join(parts)
    
    def _generate_mock_response(self, prompt: str) -> str:
        """Generate a mock response when Ollama is not available"""
        prompt_lower = prompt.lower()
        
        if "malaria" in prompt_lower and "nairobi" in prompt_lower:
            return """Based on current data for Nairobi County:

🟡 **Risk Level: MEDIUM**

**ML Prediction Analysis:**
- Outbreak probability: 42%
- Predicted cases next week: 85-120
- Confidence: 78%

**Contributing Factors:**
- Recent rainfall: 85mm (above average)
- Temperature: 24°C (optimal for mosquito breeding)
- Previous week cases: 67

**Social Media Signals:**
- 234 health-related mentions in last 24h
- Trending keywords: "fever", "mosquito", "clinic"

**Recommended Actions:**
1. 🦟 Increase mosquito control in Kibera, Mathare
2. 📊 Enhance surveillance at Level 4 hospitals
3. 💊 Verify antimalarial stock levels

*Data sources: ML Model v20260204, Social Media API, DHIS2*"""

        elif "cholera" in prompt_lower:
            return """⚠️ **Cholera Risk Assessment**

Based on current environmental and social indicators, here's my analysis:

**Key Indicators:**
- Water quality concerns reported in 3 sub-counties
- 156 social media mentions of "diarrhea" and "waterborne"
- Healthcare facility visits up 23% for GI symptoms

**Recommendations:**
1. 💧 Deploy water testing teams immediately
2. 📢 Issue public boil-water advisory
3. 🏥 Prepare ORS stockpiles at health facilities

Would you like me to generate a detailed county-by-county breakdown?"""

        else:
            return """I'm EpiBot, your disease surveillance assistant for Kenya.

I can help you with:
- 📊 **Outbreak Predictions**: Get ML-powered risk assessments for any county
- 🔍 **Social Media Insights**: View early warning signals from community reports
- 📈 **Trend Analysis**: Compare disease patterns across regions and time
- 💡 **Recommendations**: Get actionable guidance for public health response

**Try asking:**
- "What's the malaria risk in Kisumu?"
- "Show me cholera trends for coastal counties"
- "Are there any outbreak alerts today?"

How can I assist you today?"""
    
    async def close(self):
        """Close the HTTP client"""
        await self._client.aclose()


# Singleton instance
_ollama_service: Optional[OllamaService] = None


def get_ollama_service() -> OllamaService:
    """Get or create the Ollama service singleton"""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service
