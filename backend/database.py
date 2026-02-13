from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import re

# Production handling for Postgres URLs
# Handles: psql 'postgresql://user:pass@host/db'
db_url = os.getenv("DATABASE_URL", "sqlite:///./school_bus.db")

# 1. Strip psql wrapper if present
if db_url.startswith("psql "):
    # Extracts everything between the first and last single quote
    match = re.search(r"'(.*?)'", db_url)
    if match:
        db_url = match.group(1)

# 2. Fix legacy 'postgres://' prefix
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# 3. Handle SSL for Neon/Render
if "postgresql" in db_url and "sslmode" not in db_url:
    separator = "&" if "?" in db_url else "?"
    db_url += f"{separator}sslmode=require"

# 4. Connection Pooling (Critical for Free Tiers)
engine_args = {
    "pool_pre_ping": True,
    "pool_size": 5,
    "max_overflow": 0, # Strict limit to stay under DB connection caps
}

if "sqlite" in db_url:
    engine_args = {"connect_args": {"check_same_thread": False}}

engine = create_engine(db_url, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
