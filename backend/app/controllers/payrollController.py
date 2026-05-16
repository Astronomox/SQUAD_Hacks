import pandas as pd
from fastapi import UploadFile

from app.services.anomalyService import detect_anomaly
from app.services.trust_scoreService import calculate_trust_score

# Func to handle payroll file upload and processing
async def upload_payroll(file: UploadFile):

    df = pd.read_csv(file.file)

    results = []

    duplicate_accounts = df["bank_account"].value_counts()

    for _, row in df.iterrows():

        duplicate_count = duplicate_accounts[row["bank_account"]]

        anomaly_score = detect_anomaly(
            bank_account_duplicates=duplicate_count
        )

        trust_score = calculate_trust_score(
            liveness_verified=True,
            anomaly_score=anomaly_score,
            verified_device=True
        )

        status = "verified"

        if trust_score < 70:
            status = "flagged"

        results.append({
            "employee_name": row["full_name"],
            "bank_account": row["bank_account"],
            "salary": row["salary"],
            "anomaly_score": anomaly_score,
            "trust_score": trust_score,
            "status": status
        })

    return {
        "total_records": len(results),
        "results": results
    }