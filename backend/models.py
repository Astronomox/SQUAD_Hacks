from pydantic import BaseModel
from typing import Optional

# ─── AI Models ────────────────────────────────────────────────────────────────

class Employee(BaseModel):
    id: str
    salaryAmount: float
    enrollmentBatchId: Optional[str] = None
    enrollmentDate:    Optional[str] = None
    lastAttendance:    Optional[str] = None
    ipAtEnrollment:    Optional[str] = None
    deviceFingerprint: Optional[str] = None
    department:        Optional[str] = None

class ScanRequest(BaseModel):
    employees: list[Employee]

class LivenessRequest(BaseModel):
    employeeId:          str
    livenessScore:       float
    faceMatchConfidence: float
    spoofDetected:       bool  = False
    stepsPassed:         int   = 0

# ─── Squad Models ─────────────────────────────────────────────────────────────

class EscrowRequest(BaseModel):
    cycleId:        str
    totalAmount:    float
    verifiedCount:  int

class LookupRequest(BaseModel):
    bankCode:      str
    accountNumber: str

class TransferRequest(BaseModel):
    employeeId:    str
    amount:        float
    bankCode:      str
    accountNumber: str
    accountName:   str
    cycleId:       str

class SimulateRequest(BaseModel):
    virtual_account_number: str
    amount: float  # in naira — backend converts to kobo string

class EmployeeVARequest(BaseModel):
    employeeId:    str
    fullName:      str
    email:         Optional[str] = None
    mobile:        Optional[str] = None
    bankAccount:   Optional[str] = None

# ─── Employee Management Models ───────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    fullName:      str
    nin:           Optional[str] = None
    email:         Optional[str] = None
    phone:         Optional[str] = None
    department:    Optional[str] = None
    role:          Optional[str] = None
    salaryAmount:  Optional[float] = None
    bankCode:      Optional[str] = None
    bankAccount:   Optional[str] = None
    bankName:      Optional[str] = None

class NINVerifyRequest(BaseModel):
    nin:        str
    employeeId: str

class NotifyRequest(BaseModel):
    employeeId:   str
    fullName:     str
    email:        Optional[str] = None
    phone:        Optional[str] = None
    company:      str = "Kogi State Government"
    verifyLink:   str
