"""
database.py - Supabase & Local PostgreSQL Client

Supports local and Kubernetes database orchestrations by dynamically switching 
to SQLAlchemy/PostgreSQL when DATABASE_URL is configured, emulating Supabase client APIs.
"""

import logging
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# 🐘 local PostgreSQL Emulator with SQLAlchemy
# ═══════════════════════════════════════════════════════════════════════════════

try:
    from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, Boolean, DateTime
    from sqlalchemy.orm import sessionmaker, sessionmaker as SessionMakerType
    from sqlalchemy.sql import select, insert, update, delete
except ImportError:
    create_engine = None

class SQLAlchemyPostgrestEmulator:
    """
    Emulates the Supabase postgrest query syntax on top of SQLAlchemy
    for transparent PostgreSQL migrations.
    """
    def __init__(self, session_factory):
        self.session_factory = session_factory
        self._table_name = None
        self._filters = []
        self._action = None
        self._data = None

    def table(self, name: str):
        emulator = SQLAlchemyPostgrestEmulator(self.session_factory)
        emulator._table_name = name
        return emulator

    def select(self, columns: str = "*"):
        self._action = "select"
        return self

    def insert(self, data):
        self._action = "insert"
        self._data = data
        return self

    def update(self, data):
        self._action = "update"
        self._data = data
        return self

    def delete(self):
        self._action = "delete"
        return self

    def eq(self, column: str, value):
        self._filters.append((column, value))
        return self

    def execute(self):
        class Response:
            def __init__(self, data):
                self.data = data
                self.error = None

        with self.session_factory() as session:
            metadata = MetaData()
            # Direct definition of training_data schema
            t = Table(
                "training_data", metadata,
                Column("id", Integer, primary_key=True, autoincrement=True),
                Column("county", String),
                Column("disease", String),
                Column("temperature", Float),
                Column("humidity", Float),
                Column("rainfall", Float),
                Column("population_density", Float),
                Column("access_to_water", Float),
                Column("healthcare_coverage", Float),
                Column("previous_cases", Integer),
                Column("vaccination_rate", Float),
                Column("outbreak_occurred", Boolean),
                Column("cases_reported", Integer),
                Column("date", DateTime),
                Column("created_at", String),
                Column("updated_at", String)
            )

            # Auto-create the table if running on new PostgreSQL instance
            try:
                metadata.create_all(session.bind)
            except Exception as e:
                logger.warning(f"Metadata create_all error: {e}")

            try:
                if self._action == "select":
                    stmt = select(t)
                    for col, val in self._filters:
                        stmt = stmt.where(getattr(t.c, col) == val)
                    result = session.execute(stmt)
                    rows = []
                    for row in result:
                        row_dict = dict(row._mapping)
                        # Ensure standard datetime to string conversions
                        if row_dict.get('date'):
                            row_dict['date'] = row_dict['date'].isoformat()
                        rows.append(row_dict)
                    return Response(rows)

                elif self._action == "insert":
                    if isinstance(self._data, list):
                        stmt = insert(t).values(self._data).returning(t)
                        result = session.execute(stmt)
                        session.commit()
                        rows = []
                        for row in result:
                            row_dict = dict(row._mapping)
                            if row_dict.get('date'):
                                row_dict['date'] = row_dict['date'].isoformat()
                            rows.append(row_dict)
                        return Response(rows)
                    else:
                        stmt = insert(t).values(self._data).returning(t)
                        result = session.execute(stmt)
                        session.commit()
                        row = result.mappings().first()
                        row_dict = dict(row) if row else {}
                        if row_dict.get('date'):
                            row_dict['date'] = row_dict['date'].isoformat()
                        return Response([row_dict] if row_dict else [])

                elif self._action == "update":
                    stmt = update(t).values(self._data)
                    for col, val in self._filters:
                        stmt = stmt.where(getattr(t.c, col) == val)
                    stmt = stmt.returning(t)
                    result = session.execute(stmt)
                    session.commit()
                    row = result.mappings().first()
                    row_dict = dict(row) if row else {}
                    if row_dict.get('date'):
                        row_dict['date'] = row_dict['date'].isoformat()
                    return Response([row_dict] if row_dict else [])

                elif self._action == "delete":
                    stmt = delete(t)
                    for col, val in self._filters:
                        stmt = stmt.where(getattr(t.c, col) == val)
                    stmt = stmt.returning(t)
                    result = session.execute(stmt)
                    session.commit()
                    rows = []
                    for row in result:
                        row_dict = dict(row._mapping)
                        if row_dict.get('date'):
                            row_dict['date'] = row_dict['date'].isoformat()
                        rows.append(row_dict)
                    return Response(rows)
            except Exception as e:
                logger.error(f"SQLAlchemy execution failed: {e}")
                session.rollback()
                raise

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 Clients Initialization
# ═══════════════════════════════════════════════════════════════════════════════

def get_supabase_client():
    """
    Gets or emulates database client.
    """
    # 1. Check if direct PostgreSQL DATABASE_URL is configured (Docker/K8s mode)
    if settings.DATABASE_URL:
        logger.info("Initializing direct PostgreSQL database with SQLAlchemy Postgrest Emulator...")
        engine = create_engine(settings.DATABASE_URL)
        session_factory = sessionmaker(bind=engine)
        return SQLAlchemyPostgrestEmulator(session_factory)
        
    # 2. Fall back to standard cloud Supabase client
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError(
            "Neither DATABASE_URL nor Supabase credentials are configured. "
            "Please configure database settings in your env."
        )
    
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )

try:
    supabase = get_supabase_client()
except (ValueError, Exception) as e:
    supabase = None
    logger.warning(f"Database client not fully initialized: {e}")
    logger.warning("Database features disabled or running in mock mode.")
