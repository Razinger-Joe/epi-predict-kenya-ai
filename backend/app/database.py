"""
🎓 LEARNING: database.py - Supabase Client

This file creates and manages the Supabase database connection.
Supabase is a "Backend as a Service" (BaaS) that provides:
- PostgreSQL database
- Authentication
- Real-time subscriptions
- Storage

We create a single client instance and reuse it across the app.
"""

from supabase import create_client, Client
from app.config import settings


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Creating the Supabase Client
# ═══════════════════════════════════════════════════════════════════════════════
# The Supabase client needs two things:
# 1. URL - Your project's API URL (from Supabase dashboard)
# 2. Key - The anon/public key (safe for frontend) or service key (backend only)

def get_supabase_client() -> Client:
    """
    Creates and returns a Supabase client instance.
    
    🎓 LEARNING: Dependency Injection
    This function will be used with FastAPI's Depends() to inject
    the database client into route handlers.
    
    Example:
        @app.get("/data")
        async def get_data(db: Client = Depends(get_supabase_client)):
            return db.table("my_table").select("*").execute()
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError(
            "Supabase credentials not configured. "
            "Please set SUPABASE_URL and SUPABASE_KEY in your .env file."
        )
    
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )


# Create a global client for simple cases
# (For more complex apps, use dependency injection instead)
try:
    supabase: Client = get_supabase_client()
except (ValueError, Exception) as e:
    # During development/testing, allow app to start without Supabase
    # This catches both missing credentials AND invalid API key errors
    supabase = None
    print(f"⚠️ Warning: Supabase not configured or invalid credentials: {e}")
    print("   Database features disabled. API will use mock data.")


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Common Supabase Operations
# ═══════════════════════════════════════════════════════════════════════════════
# 
# SELECT (Read):
#   data = supabase.table("users").select("*").execute()
#   data = supabase.table("users").select("name, email").eq("id", 1).execute()
#
# INSERT (Create):
#   data = supabase.table("users").insert({"name": "John", "email": "john@x.com"}).execute()
#
# UPDATE:
#   data = supabase.table("users").update({"name": "Jane"}).eq("id", 1).execute()
#
# DELETE:
#   data = supabase.table("users").delete().eq("id", 1).execute()
#
# The result is in: data.data (list of records)
# Errors are in: data.error
# ═══════════════════════════════════════════════════════════════════════════════
