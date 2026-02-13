
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Production handling for Postgres URLs provided by Neon.tech, Supabase, or Render
db_url = os.getenv("DATABASE_URL", "sqlite:///./school_bus.db")

# SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Specific settings for SQLite vs PostgreSQL
connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url, 
    connect_args=connect_args,
    pool_pre_ping=True, # Verify connection health before use
    pool_size=5,        # Limit pool for free tier DBs
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
