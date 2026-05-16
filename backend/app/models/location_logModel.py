from sqlalchemy import Column, Integer, Float, String
from app.config.database import Base


class LocationLog(Base):

    __tablename__ = "location_logs"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    ip_address = Column(String)
    city = Column(String)
    country = Column(String)