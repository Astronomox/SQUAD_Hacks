"""
AI Router — Isolation Forest anomaly detection + liveness verification.
All ML logic lives here. No Squad calls.
"""
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from models import ScanRequest, LivenessRequest

router = APIRouter(tags=["AI Engine"])


def build_features(employees: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(employees)
    features = pd.DataFrame()

    def enroll_hour(d):
        try: return pd.to_datetime(d).hour
        except: return 12
    features["enroll_hour"] = df["enrollmentDate"].apply(enroll_hour)

    features["batch_size"] = (
        df.groupby("enrollmentBatchId")["id"].transform("count")
        if "enrollmentBatchId" in df.columns else pd.Series([1]*len(df))
    ).fillna(1)

    features["ip_share"] = (
        df.groupby("ipAtEnrollment")["id"].transform("count")
        if "ipAtEnrollment" in df.columns else pd.Series([1]*len(df))
    ).fillna(1)

    features["device_share"] = (
        df.groupby("deviceFingerprint")["id"].transform("count")
        if "deviceFingerprint" in df.columns else pd.Series([1]*len(df))
    ).fillna(1)

    dept_med = (
        df.groupby("department")["salaryAmount"].transform("median")
        if "department" in df.columns else df["salaryAmount"]
    )
    features["salary_ratio"] = (df["salaryAmount"] / dept_med.replace(0, 1)).fillna(1)

    def att_gap(d):
        try:
            if not d or d == "null": return 180
            return (pd.Timestamp.now() - pd.to_datetime(d)).days
        except: return 180
    features["attendance_gap"] = df["lastAttendance"].apply(att_gap)

    return features.fillna(0)


@router.post("/analyze")
async def analyze_payroll(req: ScanRequest):
    """
    Run Isolation Forest on the employee dataset.
    Returns risk scores (0-100) and flag breakdowns per employee.
    """
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
                "detail": "Device fingerprint reused across multiple accounts"})
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

    return {
        "total": len(results),
        "flagged": len([r for r in results if r["isAnomaly"]]),
        "blocked": len([r for r in results if r["riskScore"] >= 70]),
        "leakagePrevented": sum(emps[i]["salaryAmount"] for i, r in enumerate(results) if r["isAnomaly"]),
        "results": results,
        "modelInfo": {"algorithm": "IsolationForest", "estimators": 200, "contamination": 0.08}
    }


@router.post("/verify-liveness")
async def verify_liveness(req: LivenessRequest):
    """
    Evaluate facial liveness check result.
    Returns verdict: passed / review / failed / blocked.
    """
    if req.spoofDetected:
        return {"status": "blocked", "reason": "Presentation attack detected", "score": 0, "trustScore": 0}
    if req.livenessScore > 0.85 and req.faceMatchConfidence > 0.80 and req.stepsPassed >= 3:
        trust = round((req.livenessScore * 0.6 + req.faceMatchConfidence * 0.4) * 100, 1)
        return {"status": "passed", "score": round(req.livenessScore * 100, 1), "trustScore": trust}
    if req.livenessScore > 0.70:
        return {"status": "review", "score": round(req.livenessScore * 100, 1), "trustScore": round(req.livenessScore * 70, 1)}
    return {"status": "failed", "score": round(req.livenessScore * 100, 1), "trustScore": 0}
