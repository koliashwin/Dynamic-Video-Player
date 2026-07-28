import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local").lower()

default_sqlite_url = f"sqlite:///./app_{STORAGE_BACKEND}.db"
# Database Url should be read form .env
DATABASE_URL = os.getenv("DATABASE_URL", default_sqlite_url)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()