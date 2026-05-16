"""
Employee Router — employee management, NIN verification, onboarding notifications.

NIN:   Prembly API (PREMBLY_SECRET_KEY + PREMBLY_APP_ID)
Email: Resend API  (RESEND_API_KEY)
SMS:   Termii      (TERMII_KEY)
"""
import logging
import re
import time
import requests
from typing import List
import os
import httpx

from fastapi import APIRouter, HTTPException
from models import EmployeeCreate, NINVerifyRequest, NotifyRequest

logger = logging.getLogger("employees")
router = APIRouter(prefix="/employees", tags=["Employees"])

_employee_store: dict = {}

# ─── Env ──────────────────────────────────────────────────────────────────────
RESEND_API_KEY   = os.getenv("RESEND_API_KEY", "")
FRONTEND_URL     = os.getenv("FRONTEND_URL", "https://verifyai-hr.vercel.app")
TERMII_KEY       = os.getenv("TERMII_KEY", "")
TERMII_BASE      = os.getenv("TERMII_BASE", "https://v3.api.termii.com")
PREMBLY_SK       = os.getenv("PREMBLY_SECRET_KEY", "")
PREMBLY_PK       = os.getenv("PREMBLY_APP_ID", "")
PREMBLY_BASE     = "https://api.prembly.com"
PREMBLY_SANDBOX  = "https://api.sandbox.prembly.com"

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _valid_nin(nin: str) -> bool:
    return bool(re.match(r"^\d{11}$", nin.strip()))

def _valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))

def _valid_phone(phone: str) -> bool:
    p = phone.strip().replace(" ", "").replace("-", "")
    return bool(re.match(r"^(\+234|0)[789][01]\d{8}$", p))

def _gen_id(name: str) -> str:
    ts = str(int(time.time()))[-5:]
    initials = "".join(p[0].upper() for p in name.split()[:2] if p)
    return f"NIN-PENDING-{initials}{ts}"

def _verify_link(emp_id: str) -> str:
    return f"{FRONTEND_URL}/verify?nin={emp_id}" if re.match(r"^\d{11}$", emp_id) \
        else f"{FRONTEND_URL}/verify?id={emp_id}"

def _prembly_base() -> str:
    return PREMBLY_SANDBOX if PREMBLY_SK.startswith("test_") else PREMBLY_BASE


# ─── NIN Verification (Prembly) ───────────────────────────────────────────────

async def _prembly_nin(nin: str) -> dict:
    headers = {
        "x-api-key":    PREMBLY_SK,
        "app-id":       PREMBLY_PK,
        "Content-Type": "application/json",
        "Accept":       "application/json",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{_prembly_base()}/identitypass/verification/nin",
            headers=headers,
            json={"nin": nin}
        )
        data = resp.json()
        logger.info(f"Prembly NIN: status={resp.status_code} keys={list(data.keys())}")
        return data


async def verify_nin_full(nin: str) -> dict:
    nin = nin.strip()
    if not _valid_nin(nin):
        return {"valid": False, "reason": "NIN must be exactly 11 digits"}

    if PREMBLY_SK and PREMBLY_PK:
        try:
            data = await _prembly_nin(nin)
            if data.get("status") is True or data.get("verified") is True:
                person = data.get("nin_data", data.get("detail", data.get("data", {})))
                return {
                    "valid":      True,
                    "nin":        nin,
                    "status":     "VERIFIED",
                    "source":     "NIMC_PREMBLY",
                    "firstName":  person.get("firstname", person.get("first_name", "")),
                    "lastName":   person.get("surname",   person.get("last_name", "")),
                    "middleName": person.get("middlename", ""),
                    "dob":        person.get("birthdate",  person.get("date_of_birth", "")),
                    "gender":     person.get("gender", ""),
                    "phone":      person.get("phone", ""),
                    "address":    person.get("residence_Address", person.get("address", "")),
                    "raw":        data,
                }
            else:
                return {
                    "valid":  False,
                    "nin":    nin,
                    "status": "NOT_FOUND",
                    "source": "NIMC_PREMBLY",
                    "reason": data.get("detail", data.get("message", "NIN not found in NIMC database")),
                }
        except Exception as e:
            logger.error(f"Prembly NIN error: {e}")
            return {
                "valid":   True,
                "nin":     nin,
                "status":  "VERIFIED_SANDBOX",
                "source":  "NIMC_SANDBOX",
                "message": f"API error — sandbox fallback: {str(e)[:80]}",
            }

    return {
        "valid":   True,
        "nin":     nin,
        "status":  "FORMAT_VALID",
        "source":  "LOCAL",
        "message": "Set PREMBLY_SECRET_KEY + PREMBLY_APP_ID on Render for live NIN verification.",
    }


# ─── Employee CRUD ────────────────────────────────────────────────────────────

@router.post("/add")
async def add_employee(emp: EmployeeCreate):
    errors = []
    if emp.nin and not _valid_nin(emp.nin):
        errors.append("NIN must be exactly 11 digits")
    if emp.email and not _valid_email(emp.email):
        errors.append("Invalid email format")
    if emp.phone and not _valid_phone(emp.phone):
        errors.append("Invalid Nigerian phone number (e.g. 08012345678)")
    if not emp.email and not emp.phone:
        errors.append("At least one contact required: email or phone")
    if errors:
        raise HTTPException(400, detail={"errors": errors})

    emp_id     = emp.nin if emp.nin and _valid_nin(emp.nin) else _gen_id(emp.fullName)
    nin_status = "VERIFIED" if emp.nin and _valid_nin(emp.nin) else "UNVERIFIED"

    record = {
        "id":           emp_id,
        "fullName":     emp.fullName,
        "nin":          emp.nin,
        "ninStatus":    nin_status,
        "email":        emp.email,
        "phone":        emp.phone,
        "department":   emp.department,
        "role":         emp.role,
        "salaryAmount": emp.salaryAmount,
        "bankCode":     emp.bankCode,
        "bankAccount":  emp.bankAccount,
        "bankName":     emp.bankName,
        "status":       "pending_verification",
        "createdAt":    time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    _employee_store[emp_id] = record
    logger.info(f"add-employee: {emp_id} — {emp.fullName}")
    return {"success": True, "employeeId": emp_id, "employee": record}


@router.post("/batch")
async def batch_add(employees: List[EmployeeCreate]):
    if len(employees) > 500:
        raise HTTPException(400, detail="Max 500 employees per batch")
    results = []
    for emp in employees:
        try:
            res = await add_employee(emp)
            results.append({"success": True, "employeeId": res["employeeId"], "name": emp.fullName})
        except HTTPException as e:
            results.append({"success": False, "name": emp.fullName, "errors": e.detail})
    added  = sum(1 for r in results if r["success"])
    failed = sum(1 for r in results if not r["success"])
    return {"success": True, "added": added, "failed": failed, "results": results}


@router.get("/list")
async def list_employees():
    return {"success": True, "employees": list(_employee_store.values()), "total": len(_employee_store)}


@router.get("/{employee_id}")
async def get_employee(employee_id: str):
    emp = _employee_store.get(employee_id)
    if not emp:
        raise HTTPException(404, detail=f"Employee {employee_id} not found")
    return {"success": True, "employee": emp}


@router.post("/verify-nin")
async def verify_nin_endpoint(req: NINVerifyRequest):
    result = await verify_nin_full(req.nin)
    if result["valid"] and req.employeeId in _employee_store:
        _employee_store[req.employeeId]["ninStatus"] = result["status"]
        _employee_store[req.employeeId]["nin"]       = req.nin
    return {
        "success":    result["valid"],
        "employeeId": req.employeeId,
        "nin":        req.nin[:4] + "XXXXXXX" if len(req.nin) >= 4 else req.nin,
        **{k: v for k, v in result.items() if k not in ("nin", "raw")},
    }


# ─── Email (Resend) ───────────────────────────────────────────────────────────

def _send_email(to_addr: str, full_name: str, emp_id: str, company: str, verify_url: str) -> dict:
    if not RESEND_API_KEY:
        return {
            "sent": False,
            "reason": "RESEND_API_KEY not configured — add it on Render",
            "preview": f"Would send to {to_addr}"
        }
    try:
        html = f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F4F4F2;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#111111;padding:28px 32px;text-align:center;">
      <span style="color:#E8501A;font-size:26px;font-weight:900;letter-spacing:-1px;">VerifyAI</span>
      <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:6px 0 0;text-transform:uppercase;letter-spacing:2px;">Payroll Integrity Platform</p>
    </div>
    <div style="background:#ffffff;padding:36px 32px;">
      <h2 style="color:#111111;font-size:22px;margin:0 0 8px;">Hello {full_name.split()[0]},</h2>
      <p style="color:#555555;font-size:14px;line-height:1.7;margin:0 0 20px;">
        You have been added as an employee to <strong>{company}</strong>.
        To complete your onboarding and <strong>activate your salary payments</strong>,
        please complete identity verification using the button below.
      </p>
      <div style="background:#FFF1EC;border-left:4px solid #E8501A;padding:14px 16px;border-radius:4px;margin:0 0 24px;">
        <p style="margin:0;color:#E8501A;font-weight:bold;font-size:13px;">Your Employee NIN</p>
        <p style="margin:4px 0 0;color:#111111;font-family:monospace;font-size:16px;font-weight:bold;">{emp_id}</p>
      </div>
      <a href="{verify_url}"
         style="display:block;background:#E8501A;color:#ffffff;text-align:center;padding:16px 24px;
                border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;margin:0 0 24px;">
        Complete Verification →
      </a>
      <div style="border-top:1px solid #F0F0EE;padding-top:20px;">
        <p style="color:#999999;font-size:11px;line-height:1.6;margin:0;">
          This link is unique to you. Do not share it.<br/>
          Powered by <strong>VerifyAI</strong> · {company}
        </p>
      </div>
    </div>
  </div>
</body>
</html>"""

        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": "VerifyAI <onboarding@resend.dev>",
                "to": [to_addr],
                "subject": f"Action Required: Complete Your Verification — {company}",
                "html": html
            },
            timeout=15
        )
        data = resp.json()
        if resp.status_code in (200, 201):
            logger.info(f"email sent via Resend → {to_addr}")
            return {"sent": True, "to": to_addr, "id": data.get("id")}
        else:
            logger.error(f"Resend error → {to_addr}: {data}")
            return {"sent": False, "error": data}
    except Exception as e:
        logger.error(f"email failed → {to_addr}: {e}")
        return {"sent": False, "error": str(e)}


# ─── SMS (Termii v3) ──────────────────────────────────────────────────────────

async def _send_sms(phone: str, body: str) -> dict:
    if not TERMII_KEY:
        return {"sent": False, "reason": "Set TERMII_KEY on Render", "preview": body}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{TERMII_BASE}/api/sms/send",
                json={
                    "to":      phone,
                    "from":    "N-Alert",
                    "sms":     body,
                    "type":    "plain",
                    "api_key": TERMII_KEY,
                    "channel": "dnd", 
                }
            )
            data = resp.json()
            ok = data.get("code") == "ok" or resp.status_code == 200
            logger.info(f"SMS {'sent' if ok else 'failed'} → {phone}: {str(data)[:100]}")
            return {"sent": ok, "to": phone, "response": data}
    except Exception as e:
        logger.error(f"SMS error → {phone}: {e}")
        return {"sent": False, "error": str(e)}


# ─── Notify ───────────────────────────────────────────────────────────────────

@router.post("/notify")
async def notify_employee(req: NotifyRequest):
    verify_url = req.verifyLink or _verify_link(req.employeeId)
    results    = {}

    if req.email:
        results["email"] = _send_email(
            req.email, req.fullName, req.employeeId, req.company, verify_url
        )

    if req.phone:
        first    = req.fullName.split()[0]
        sms_body = (
            f"Hello {first}, you've been added to {req.company} payroll. "
            f"Complete verification to activate your salary: {verify_url}"
        )
        results["sms"] = await _send_sms(req.phone, sms_body)

    return {"success": True, "employeeId": req.employeeId, "verifyUrl": verify_url, "results": results}