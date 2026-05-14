from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import httpx
import os
import json
import time
from typing import Optional
import uvicorn

app = FastAPI(title="VerifyAI AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SQUAD_SECRET = "sandbox_sk_a5b7f02908547633e42760ecb16f6b494527b5dd7946"
SQUAD_BASE   = "https://sandbox-api-d.squadco.com"

SQUAD_HEADERS = {
    "Authorization": f"Bearer {SQUAD_SECRET}",
    "Content-Type": "application/json"
}

# ─── AI: Anomaly Detection ────────────────────────────────────────────────────

class Employee(BaseModel):
    id: str
    salaryAmount: float
    enrollmentBatchId: Optional[str] = None
    enrollmentDate: Optional[str] = None
    lastAttendance: Optional[str] = None
    ipAtEnrollment: Optional[str] = None
    deviceFingerprint: Optional[str] = None
    department: Optional[str] = None

class ScanRequest(BaseModel):
    employees: list[Employee]

def build_features(employees: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(employees)
    features = pd.DataFrame()

    def enroll_hour(d):
        try: return pd.to_datetime(d).hour
        except: return 12
    features["enroll_hour"] = df["enrollmentDate"].apply(enroll_hour)

    batch_counts = df.groupby("enrollmentBatchId")["id"].transform("count") if "enrollmentBatchId" in df.columns else pd.Series([1]*len(df))
    features["batch_size"] = batch_counts.fillna(1)

    ip_counts = df.groupby("ipAtEnrollment")["id"].transform("count") if "ipAtEnrollment" in df.columns else pd.Series([1]*len(df))
    features["ip_share"] = ip_counts.fillna(1)

    dev_counts = df.groupby("deviceFingerprint")["id"].transform("count") if "deviceFingerprint" in df.columns else pd.Series([1]*len(df))
    features["device_share"] = dev_counts.fillna(1)

    dept_med = df.groupby("department")["salaryAmount"].transform("median") if "department" in df.columns else df["salaryAmount"]
    features["salary_ratio"] = (df["salaryAmount"] / dept_med.replace(0, 1)).fillna(1)

    def att_gap(d):
        try:
            if not d or d == "null": return 180
            return (pd.Timestamp.now() - pd.to_datetime(d)).days
        except: return 180
    features["attendance_gap"] = df["lastAttendance"].apply(att_gap)

    return features.fillna(0)

@app.post("/analyze")
async def analyze_payroll(req: ScanRequest):
    if len(req.employees) < 2:
        raise HTTPException(400, "Need at least 2 employees")

    emps = [e.model_dump() for e in req.employees]
    features = build_features(emps)

    scaler = StandardScaler()
    X = scaler.fit_transform(features)

    model = IsolationForest(n_estimators=200, contamination=0.08, random_state=42)
    model.fit(X)

    raw_scores  = model.score_samples(X)
    predictions = model.predict(X)

    mn, mx = raw_scores.min(), raw_scores.max()
    risk_scores = ((mx - raw_scores) / (mx - mn + 1e-9) * 100).round(1)

    results = []
    for i, emp in enumerate(emps):
        is_anomaly = bool(predictions[i] == -1)
        risk = float(risk_scores[i])
        f = features.iloc[i]

        flags = []
        if f["batch_size"] >= 20:
            flags.append({"type": "bulk_enrollment", "points": 40,
                "title": f"Bulk enrollment (batch of {int(f['batch_size'])})",
                "detail": f"Enrolled in batch {emp.get('enrollmentBatchId')} with {int(f['batch_size'])} others"})
        if f["ip_share"] >= 3:
            flags.append({"type": "duplicate_ip", "points": min(40, int(f["ip_share"]) * 6),
                "title": f"Shared IP with {int(f['ip_share'])-1} employees",
                "detail": f"IP {emp.get('ipAtEnrollment')} shared across {int(f['ip_share'])} accounts"})
        if f["device_share"] >= 2:
            flags.append({"type": "device_reuse", "points": min(35, int(f["device_share"]) * 8),
                "title": f"Device shared with {int(f['device_share'])-1} employees",
                "detail": f"Device fingerprint reused across multiple accounts"})
        if f["attendance_gap"] >= 90:
            flags.append({"type": "attendance_gap", "points": 22,
                "title": f"No attendance in {int(f['attendance_gap'])} days",
                "detail": "Last attendance record is over 90 days ago or missing"})
        if f["salary_ratio"] >= 4:
            flags.append({"type": "salary_outlier", "points": 25,
                "title": f"Salary {f['salary_ratio']:.1f}x department median",
                "detail": "Salary significantly above department median"})
        if f["enroll_hour"] < 5 or f["enroll_hour"] > 22:
            flags.append({"type": "off_hours_enrollment", "points": 15,
                "title": f"Enrolled at {int(f['enroll_hour'])}:00 (off-hours)",
                "detail": "Enrollment occurred outside normal business hours"})

        results.append({
            "id": emp["id"],
            "riskScore": risk,
            "isAnomaly": is_anomaly,
            "flags": flags,
            "status": "blocked" if risk >= 70 else "flagged" if risk >= 40 else "verified"
        })

    flagged = [r for r in results if r["isAnomaly"]]
    return {
        "total": len(results),
        "flagged": len(flagged),
        "blocked": len([r for r in results if r["riskScore"] >= 70]),
        "leakagePrevented": sum(emps[i]["salaryAmount"] for i, r in enumerate(results) if r["isAnomaly"]),
        "results": results,
        "modelInfo": {"algorithm": "IsolationForest", "estimators": 200, "contamination": 0.08}
    }

# ─── Liveness Verification ────────────────────────────────────────────────────

class LivenessRequest(BaseModel):
    employeeId: str
    livenessScore: float
    faceMatchConfidence: float
    spoofDetected: bool = False
    stepsPassed: int = 0

@app.post("/verify-liveness")
async def verify_liveness(req: LivenessRequest):
    if req.spoofDetected:
        return {"status": "blocked", "reason": "Presentation attack detected", "score": 0, "trustScore": 0}
    if req.livenessScore > 0.85 and req.faceMatchConfidence > 0.80 and req.stepsPassed >= 3:
        trust = round((req.livenessScore * 0.6 + req.faceMatchConfidence * 0.4) * 100, 1)
        return {"status": "passed", "score": round(req.livenessScore * 100, 1), "trustScore": trust}
    if req.livenessScore > 0.70:
        return {"status": "review", "score": round(req.livenessScore * 100, 1), "trustScore": round(req.livenessScore * 70, 1)}
    return {"status": "failed", "score": round(req.livenessScore * 100, 1), "trustScore": 0}

# ─── Squad: Create Escrow Virtual Account ─────────────────────────────────────

class EscrowRequest(BaseModel):
    cycleId: str
    totalAmount: float
    verifiedCount: int

@app.post("/squad/create-escrow")
async def create_escrow(req: EscrowRequest):
    payload = {
        "customer_identifier": f"verifyai_{req.cycleId}_{int(time.time())}",
        "first_name": "VerifyAI",
        "last_name": "Payroll",
        "mobile_num": "08012345678",
        "email": "payroll@verifyai.ng",
        "bvn": "22190239861",
        "dob": "10/30/1990",
        "address": "22 Marina Street, Lagos",
        "gender": "1",
        "beneficiary_account": "0123456789"
    }
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(f"{SQUAD_BASE}/virtual-account", headers=SQUAD_HEADERS, json=payload)
            data = resp.json()
            va_number = data.get("data", {}).get("virtual_account_number", "")

            # If VA created successfully, simulate payroll funds being deposited
            if va_number:
                sim_payload = {
                    "virtual_account_number": va_number,
                    "amount": int(req.totalAmount * 100)  # kobo
                }
                await client.post(
                    f"{SQUAD_BASE}/virtual-account/simulate/payment",
                    headers=SQUAD_HEADERS,
                    json=sim_payload
                )

            return {
                "success": True,
                "squadResponse": data,
                "escrowRef": va_number or f"SQ-{req.cycleId}-{int(time.time())}",
                "virtual_account_number": va_number,
                "bank": data.get("data", {}).get("bank", "Squad MFB"),
                "amount": req.totalAmount,
                "verifiedEmployees": req.verifiedCount
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "escrowRef": f"SQ-{req.cycleId}-ERR",
                "amount": req.totalAmount,
                "verifiedEmployees": req.verifiedCount
            }

# ─── Squad: Account Lookup ────────────────────────────────────────────────────

class LookupRequest(BaseModel):
    bankCode: str
    accountNumber: str

@app.post("/squad/account-lookup")
async def account_lookup(req: LookupRequest):
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.post(
                f"{SQUAD_BASE}/payout/account/lookup",
                headers=SQUAD_HEADERS,
                json={"bank_code": req.bankCode, "account_number": req.accountNumber}
            )
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

# ─── Squad: Disburse Salary ───────────────────────────────────────────────────

class TransferRequest(BaseModel):
    employeeId: str
    amount: float
    bankCode: str
    accountNumber: str
    accountName: str
    cycleId: str

@app.post("/squad/disburse")
async def disburse_salary(req: TransferRequest):
    txn_ref = f"VERIFYAI_{req.employeeId}_{int(time.time())}"
    # Squad Transfer API uses nip_code (6-digit NIP code, not 3-digit bank code)
    # Common NIP codes: GTBank=000013, Zenith=000015, Access=000014, UBA=000004, First=000016
    nip_code = req.bankCode if len(req.bankCode) == 6 else "000013"
    payload = {
        "transaction_reference": txn_ref,
        "amount": str(int(req.amount * 100)),  # kobo
        "bank_code": nip_code,
        "account_number": req.accountNumber or "0123456789",
        "account_name": req.accountName,
        "currency_id": "NGN",
        "remark": f"VerifyAI Salary - {req.employeeId} - Cycle {req.cycleId}"
    }
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(f"{SQUAD_BASE}/payout/transfer", headers=SQUAD_HEADERS, json=payload)
            data = resp.json()
            return {"success": True, "txnRef": txn_ref, "squadResponse": data}
        except Exception as e:
            return {"success": False, "txnRef": txn_ref, "error": str(e)}

# ─── Squad: Verify Transaction ────────────────────────────────────────────────

@app.get("/squad/verify/{txn_ref}")
async def verify_transaction(txn_ref: str):
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/transaction/verify/{txn_ref}", headers=SQUAD_HEADERS)
            return resp.json()
        except Exception as e:
            return {"error": str(e)}

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "VerifyAI AI Engine",
        "squad_key": SQUAD_SECRET[:18] + "...",
        "squad_merchant": "SB9GB7333N"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
