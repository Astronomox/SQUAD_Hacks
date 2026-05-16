'''
PayrollBatch
- id
- month
- total_amount
- status
'''

'''
PayrollEntry
- employee_id
- amount
- anomaly_score
- verification_status
'''

from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.config.database import Base


class PayrollEntry(Base):
    __tablename__ = "payroll_entries"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    amount = Column(Float)
    anomaly_score = Column(Float, default=0)
    verification_status = Column(String, default="pending")