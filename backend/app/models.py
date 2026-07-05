# app/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime ,timezone

from .database import Base

class SpatialGrid(Base):
    __tablename__ = "spatial_grids"

    id = Column(Integer, primary_key=True, index=True)
    grid_code = Column(String, unique=True, index=True, nullable=False)
    
    # SRID 4326 represents standard WGS84 coordinates (latitude/longitude)
    # We use POLYGON to define the boundaries of each 1km x 1km grid cell
    geom = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False)
    
    # Relationship to link sensor readings directly to this grid cell
    observations = relationship("SensorObservation", back_populates="grid")


class SensorObservation(Base):
    __tablename__ = "sensor_observations"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda:datetime.now(timezone.utc), index=True)
    
    # Pollutant and environmental metrics
    pm2_5 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    aqi = Column(Integer, nullable=True)
    temperature = Column(Float, nullable=True)
    
    # The exact geolocation (POINT) where this specific reading was taken
    location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    
    # Linking the reading to a specific grid cell to avoid slow spatial joins during heavy queries
    grid_id = Column(Integer, ForeignKey("spatial_grids.id"), nullable=True)
    grid = relationship("SpatialGrid", back_populates="observations")