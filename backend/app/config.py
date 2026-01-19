"""
🎓 LEARNING: config.py - Configuration Management

This file handles all your application's configuration using environment variables.
Why environment variables?
1. Security - Never commit secrets (API keys) to git
2. Flexibility - Different values for dev/staging/production
3. Best Practice - The "12-Factor App" methodology recommends this

We use Pydantic Settings to:
- Load values from .env file
- Validate that required values exist
- Provide type hints for IDE support
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    🎓 LEARNING: Pydantic Settings
    
    This class automatically reads from environment variables.
    Variable names match the attribute names (case-insensitive).
    
    Example:
        SUPABASE_URL in .env → settings.SUPABASE_URL in code
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
    
    # 🎓 LEARNING: model_config replaces the old "class Config"
    # This tells Pydantic where to find the .env file
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,  # SUPABASE_URL = supabase_url
    }


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
