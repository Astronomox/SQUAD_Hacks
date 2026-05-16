"""
Employee Router — employee management, NIN verification, onboarding notifications.
"""
import logging
import re
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

from models import EmployeeCreate, NINVerifyRequest, NotifyRequest

logger = logging.getLogger("employees")
router = APIRouter(prefix="/employees", tags=["Employees"])

# In-memory store for demo (employees added at runtime)
_employee_store: dict = {}

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL  = os.getenv("FRONTEND_URL", "https://verifyai-rho.vercel.app")


# ─── Validation helpers ───────────────────────────────────────────────────────

def validate_nin(nin: str) -> dict:
    """Validate Nigerian NIN format (11 digits). Real integration point."""
    nin = nin.strip().replace(" ", "")
    if not re.match(r"^\d{11}$", nin):
        return {"valid": False, "reason": "NIN must be exactly 11 digits"}
    # Simulate NIN lookup (replace with real NIMC API when available)
    # Real endpoint: https://api.verified.africa/signatoryService/v3?serviceType=NIN-VERIFY
    return {
        "valid":    True,
        "nin":      nin,
        "status":   "VERIFIED",
        "source":   "NIMC_SANDBOX",
        "message":  "NIN format valid — awaiting live NIMC API credentials",
    }

def validate_email(email: str) -> bool:
    return bool(re.match(r"^[^@]+@[^@]+\.[^@]+$", email))

def validate_phone(phone: str) -> bool:
    phone = phone.strip().replace(" ", "").replace("-", "")
    return bool(re.match(r"^(\+234|0)[789][01]\d{8}$", phone))

def generate_employee_id(name: str) -> str:
    ts = str(int(time.time()))[-5:]
    initials = ''.join(p[0].upper() for p in name.split()[:2])
    return f"EMP-{initials}{ts}"


# ─── Employee CRUD ────────────────────────────────────────────────────────────

@router.post("/add")
async def add_employee(emp: EmployeeCreate):
    """Add a single employee manually. Validates NIN, email, phone format."""
    errors = []

    if emp.nin and not validate_nin(emp.nin)["valid"]:
        errors.append("Invalid NIN format — must be 11 digits")
    if emp.email and not validate_email(emp.email):
        errors.append("Invalid email format")
    if emp.phone and not validate_phone(emp.phone):
        errors.append("Invalid phone — must be Nigerian format (080/090/070...)")
    if not emp.email and not emp.phone:
        errors.append("Employee must have at least one contact: email or phone")

    if errors:
        raise HTTPException(400, detail={"errors": errors})

    # NIN becomes the employee's unique ID if provided
    if emp.nin and validate_nin(emp.nin)["valid"]:
        emp_id = emp.nin  # NIN IS the unique identifier
        nin_result = {"valid": True, "status": "VERIFIED"}
    else:
        emp_id = generate_employee_id(emp.fullName)
        nin_result = {"valid": False, "status": "UNVERIFIED"}

    record = {
        "id":          emp_id,
        "fullName":    emp.fullName,
        "nin":         emp.nin,
        "ninStatus":   nin_result.get("status", "UNVERIFIED"),
        "email":       emp.email,
        "phone":       emp.phone,
        "department":  emp.department,
        "role":        emp.role,
        "salaryAmount": emp.salaryAmount,
        "bankCode":    emp.bankCode,
        "bankAccount": emp.bankAccount,
        "bankName":    emp.bankName,
        "status":      "pending_verification",
        "createdAt":   time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    _employee_store[emp_id] = record
    logger.info(f"add-employee: {emp_id} {emp.fullName}")

    return {"success": True, "employeeId": emp_id, "employee": record}


@router.post("/batch")
async def batch_add_employees(employees: List[EmployeeCreate]):
    """Batch add multiple employees. Returns results per employee."""
    if len(employees) > 500:
        raise HTTPException(400, detail="Max 500 employees per batch")

    results = []
    for emp in employees:
        try:
            result = await add_employee(emp)
            results.append({"success": True, "employeeId": result["employeeId"], "name": emp.fullName})
        except HTTPException as e:
            results.append({"success": False, "name": emp.fullName, "errors": e.detail})

    added   = [r for r in results if r["success"]]
    failed  = [r for r in results if not r["success"]]
    logger.info(f"batch-add: {len(added)} added, {len(failed)} failed")

    return {"success": True, "added": len(added), "failed": len(failed), "results": results}


@router.get("/list")
async def list_employees():
    """List all employees added via the API (runtime store)."""
    return {"success": True, "employees": list(_employee_store.values()), "total": len(_employee_store)}


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    emp = _employee_store.get(employee_id)
    if not emp:
        raise HTTPException(404, detail=f"Employee {employee_id} not found")
    return {"success": True, "employee": emp}


# ─── NIN Verification ─────────────────────────────────────────────────────────

@router.post("/verify-nin")
async def verify_nin(req: NINVerifyRequest):
    """
    Validate and verify NIN.
    Sandbox: validates format + returns simulated NIMC response.
    Production: swap with real NIMC/Verified.Africa API call.
    """
    result = validate_nin(req.nin)
    if not result["valid"]:
        return {"success": False, "employeeId": req.employeeId, **result}

    # Update store if employee exists
    if req.employeeId in _employee_store:
        _employee_store[req.employeeId]["ninStatus"] = "VERIFIED"
        _employee_store[req.employeeId]["nin"]       = req.nin

    logger.info(f"verify-nin: {req.employeeId} NIN={req.nin[:4]}XXXXXXX")
    return {
        "success":    True,
        "employeeId": req.employeeId,
        "nin":        req.nin[:4] + "XXXXXXX",  # masked
        "status":     "VERIFIED",
        "source":     "NIMC_SANDBOX",
        "note":       "Replace with real NIMC API: https://api.verified.africa/signatoryService/v3?serviceType=NIN-VERIFY",
    }


# ─── Notification (Email + SMS) ───────────────────────────────────────────────

@router.post("/notify")
async def notify_employee(req: NotifyRequest):
    """
    Send onboarding notification to employee.
    Email via Google SMTP. SMS via stub (wire Termii/Twilio for production).
    """
    results = {"email": None, "sms": None}
    # If employeeId is a NIN (11 digits), use nin= param; else use id=
    import re as _re
    if _re.match(r"^\d{11}$", req.employeeId):
        verify_url = f"{FRONTEND_URL}/verify?nin={req.employeeId}"
    else:
        verify_url = f"{FRONTEND_URL}/verify?id={req.employeeId}"
    if req.verifyLink:
        verify_url = req.verifyLink

    # ── Email via Google SMTP ──────────────────────────────────────────────
    if req.email and SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Action Required: Complete Your Verification — {req.company}"
            msg["From"]    = SMTP_USER
            msg["To"]      = req.email

            html = f"""
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;">
  <div style="background:#111;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <span style="color:#E8501A;font-size:28px;font-weight:900;">VerifyAI</span>
  </div>
  <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4e4e4;">
    <h2 style="color:#111;font-size:20px;margin:0 0 12px;">Hello {req.fullName},</h2>
    <p style="color:#555;line-height:1.6;">
      You have been added as an employee to <strong>{req.company}</strong>.
      To complete your onboarding and activate salary payments, you must complete identity verification.
    </p>
    <div style="background:#FFF1EC;border-left:4px solid #E8501A;padding:16px;margin:20px 0;border-radius:4px;">
      <p style="margin:0;color:#E8501A;font-weight:bold;">Your Employee ID: {req.employeeId}</p>
    </div>
    <a href="{verify_url}" style="display:block;background:#E8501A;color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin:24px 0;">
      Complete Verification →
    </a>
    <p style="color:#999;font-size:12px;text-align:center;">
      This link is unique to you. Do not share it.<br/>
      Powered by VerifyAI · {req.company}
    </p>
  </div>
</div>
"""
            msg.attach(MIMEText(html, "html"))
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, req.email, msg.as_string())
            results["email"] = {"sent": True, "to": req.email}
            logger.info(f"notify: email sent to {req.email}")
        except Exception as e:
            results["email"] = {"sent": False, "error": str(e)}
            logger.error(f"notify: email failed — {e}")
    elif req.email:
        # SMTP not configured — return what would be sent
        results["email"] = {
            "sent":    False,
            "reason":  "SMTP not configured — set SMTP_USER and SMTP_PASSWORD env vars",
            "preview": f"Would send to: {req.email} with link: {verify_url}",
        }

    # ── SMS stub (wire Termii or Twilio here) ──────────────────────────────
    if req.phone:
        sms_body = (
            f"Hello {req.fullName.split()[0]}, you have been added to {req.company} payroll. "
            f"Complete verification: {verify_url} — Employee ID: {req.employeeId}"
        )
        # TODO: replace with real Termii call
        # import httpx
        # await httpx.AsyncClient().post("https://api.ng.termii.com/api/sms/send", json={
        #     "to": req.phone, "from": "VerifyAI", "sms": sms_body,
        #     "type": "plain", "api_key": os.getenv("TERMII_KEY"), "channel": "generic"
        # })
        results["sms"] = {
            "sent":    False,
            "reason":  "SMS stub — wire Termii/Twilio via TERMII_KEY env var",
            "preview": sms_body,
        }
        logger.info(f"notify: SMS stub for {req.phone}")

    return {
        "success":    True,
        "employeeId": req.employeeId,
        "verifyUrl":  verify_url,
        "results":    results,
    }
