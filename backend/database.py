
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

def get_url():
    # Use environment variable if present, otherwise fallback to local SQLite
    url = os.getenv("DATABASE_URL")
    
    if not url:
        return "sqlite:///./school_bus.db"
    
    # Fix Render/Heroku legacy postgres:// prefix
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        
    # ENFORCE SSL for cloud providers like Neon or Supabase
    if "postgresql" in url and "sslmode" not in url:
        separator = "&" if "?" in url else "?"
        url += f"{separator}sslmode=require"
        
    return url

SQLALCHEMY_DATABASE_URL = get_url()

engine_args = {"pool_pre_ping": True}

# SQLite requires a specific argument, PostgreSQL does not
if not SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # Optimized for free tiers (e.g., Neon/Supabase)
    engine_args.update({
        "pool_size": 5,
        "max_overflow": 0,
        "pool_timeout": 30
    })

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
