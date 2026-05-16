from sqlalchemy import Column, Integer, String, Float, Boolean
from app.config.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    employee_code = Column(String, unique=True)
    department = Column(String)
    bank_account = Column(String)
    trust_score = Column(Float, default=0)
    is_verified = Column(Boolean, default=False)