# init_db.py
from app.database import engine, Base
from app.models import SpatialGrid, SensorObservation

def generate_tables():
    print("Connecting to PostGIS and creating spatial tables...")
    # create_all() checks if tables exist, and creates them if they do not.
    Base.metadata.create_all(bind=engine)
    print("Tables generated successfully!")

if __name__ == "__main__":
    generate_tables()   