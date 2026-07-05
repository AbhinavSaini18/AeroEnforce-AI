# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The connection string to your local Docker PostGIS instance.
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://aero_admin:aero_secure_password_2026@localhost:5432/aeroenforce"

# The engine is the core interface to the database. 
# echo=True prints the generated SQL to the console, which is helpful for debugging.
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# SessionLocal creates independent database sessions for each API request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class for all our database models.
Base = declarative_base()