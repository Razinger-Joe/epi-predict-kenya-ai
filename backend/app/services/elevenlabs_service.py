"""
ElevenLabs Text-to-Speech Service

Provides voice synthesis for the EpiBot chatbot.
Falls back to browser-based TTS if API key is not configured.
"""

import httpx
import logging
import os
from typing import Optional
import base64

logger = logging.getLogger(__name__)

ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel - professional female voice


class ElevenLabsService:
    """Service for ElevenLabs Text-to-Speech"""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", DEFAULT_VOICE_ID)
        self._client = httpx.AsyncClient(timeout=30.0)
    
    @property
    def is_configured(self) -> bool:
        """Check if ElevenLabs API key is configured"""
        return bool(self.api_key)
    
    async def text_to_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        model_id: str = "eleven_monolingual_v1"
    ) -> Optional[bytes]:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert to speech
            voice_id: ElevenLabs voice ID (uses default if not specified)
            model_id: TTS model to use
            
        Returns:
            Audio bytes (MP3 format) or None if failed
        """
        if not self.is_configured:
            logger.warning("ElevenLabs API key not configured")
            return None
        
        voice = voice_id or self.voice_id
        
        try:
            response = await self._client.post(
                f"{ELEVENLABS_API_URL}/text-to-speech/{voice}",
                headers={
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": model_id,
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    }
                }
            )
            
            if response.status_code == 200:
                return response.content
            else:
                logger.error(f"ElevenLabs error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"ElevenLabs TTS failed: {e}")
            return None
    
    async def text_to_speech_base64(self, text: str) -> Optional[str]:
        """
        Convert text to speech and return as base64-encoded string
        Useful for embedding audio directly in API responses
        """
        audio_bytes = await self.text_to_speech(text)
        if audio_bytes:
            return base64.b64encode(audio_bytes).decode('utf-8')
        return None
    
    async def get_voices(self) -> list:
        """Get list of available voices"""
        if not self.is_configured:
            return []
        
        try:
            response = await self._client.get(
                f"{ELEVENLABS_API_URL}/voices",
                headers={"xi-api-key": self.api_key}
            )
            if response.status_code == 200:
                return response.json().get("voices", [])
            return []
        except Exception as e:
            logger.error(f"Failed to get voices: {e}")
            return []
    
    async def close(self):
        """Close the HTTP client"""
        await self._client.aclose()


# Singleton instance
_elevenlabs_service: Optional[ElevenLabsService] = None


def get_elevenlabs_service() -> ElevenLabsService:
    """Get or create the ElevenLabs service singleton"""
    global _elevenlabs_service
    if _elevenlabs_service is None:
        _elevenlabs_service = ElevenLabsService()
    return _elevenlabs_service
