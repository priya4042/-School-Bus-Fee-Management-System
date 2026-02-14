from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import re

def get_url():
    url = os.getenv("DATABASE_URL", "sqlite:///./school_bus.db")
    
    # Render/Neon specific cleanup
    if url.startswith("psql "):
        url = url.replace("psql ", "", 1)
    
    url = url.strip("'\" ")
    
    # Fix legacy postgres:// prefix
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        
    # ENFORCE SSL (Required for Neon/Render)
    if "postgresql" in url:
        if "sslmode" not in url:
            separator = "&" if "?" in url else "?"
            url += f"{separator}sslmode=require"
        
    return url

SQLALCHEMY_DATABASE_URL = get_url()

# Optimization for Render Free Tier (Limit connections)
engine_args = {
    "pool_pre_ping": True,
}

if SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    engine_args.update({
        "pool_size": 2, # Stay well within Neon's free limit
        "max_overflow": 0,
        "pool_timeout": 60
    })
else:
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
