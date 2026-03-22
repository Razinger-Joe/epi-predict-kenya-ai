"""
config.py - Configuration Management

This file handles all your application's configuration using environment variables.
Why environment variables?
1. Security - Never commit secrets (API keys) to git
2. Flexibility - Different values for dev/staging/production
3. Best Practice - The "12-Factor App" methodology recommends this

We use Pydantic Settings to:
- Load values from .env file (if it exists)
- Fall back to system environment variables (Railway injects these)
- Validate that required values exist
- Provide type hints for IDE support
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """
    Pydantic Settings class - reads from environment variables.
    
    In development: reads from .env file
    In production (Railway): reads from injected env vars
    """
    
    # ═══════════════════════════════════════════════════════════════════════════
    # Supabase Configuration
    # ═══════════════════════════════════════════════════════════════════════════
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # ═══════════════════════════════════════════════════════════════════════════
    # Application Settings
    # ═══════════════════════════════════════════════════════════════════════════
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    PORT: int = 8000  # Railway sets this automatically
    
    # ═══════════════════════════════════════════════════════════════════════════
    # Twitter/X via twikit (free unofficial API)
    # ═══════════════════════════════════════════════════════════════════════════
    TWITTER_USERNAME: str = ""
    TWITTER_EMAIL: str = ""
    TWITTER_PASSWORD: str = ""
    
    # ═══════════════════════════════════════════════════════════════════════════
    # Facebook Graph API
    # ═══════════════════════════════════════════════════════════════════════════
    FACEBOOK_ACCESS_TOKEN: str = ""
    FACEBOOK_PAGE_IDS: str = ""  # Comma-separated page IDs or usernames

    # ═══════════════════════════════════════════════════════════════════════════
    # Grok xAI — OpenAI-compatible API (live X/web search + classification)
    # ═══════════════════════════════════════════════════════════════════════════
    XAI_API_KEY: str = ""
    XAI_MODEL: str = "grok-3-mini"

    # ═══════════════════════════════════════════════════════════════════════════
    # Social Media Harvest Mode: "live", "mock", or "hybrid"
    # ═══════════════════════════════════════════════════════════════════════════
    SOCIAL_HARVEST_MODE: str = "hybrid"
    
    # Configuration using modern Pydantic v2 syntax
    model_config = SettingsConfigDict(
        env_file=".env",           # Load from .env if it exists
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",            # Ignore unexpected env vars (Railway adds many)
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Caching with lru_cache
# ═══════════════════════════════════════════════════════════════════════════════
# @lru_cache ensures we only create ONE Settings instance.
# Without this, reading the .env file would happen every time we access settings.
# This is called the "Singleton" pattern.

@lru_cache()
def get_settings() -> Settings:
    """
    Returns the cached settings instance.
    
    Usage:
        from app.config import settings
        print(settings.SUPABASE_URL)
    """
    return Settings()


# Create a global settings instance for easy importing
settings = get_settings()


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Why This Pattern?
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Instead of:
#   import os
#   url = os.getenv("SUPABASE_URL")  # Could be None, no validation
#
# We do:
#   from app.config import settings
#   url = settings.SUPABASE_URL  # Type-safe, validated, cached
#
# Benefits:
# 1. If SUPABASE_URL is missing, app fails fast with a clear error
# 2. IDE knows the type (str), gives autocomplete
# 3. Centralized configuration
# ═══════════════════════════════════════════════════════════════════════════════
