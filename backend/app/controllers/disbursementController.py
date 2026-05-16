import pandas as pd

from fastapi import UploadFile

from app.services.anomalyService import detect_anomaly
from app.services.trust_scoreService import calculate_trust_score
from app.services.sqaudService import release_salary


async def disburse_payroll(file: UploadFile):

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

        if trust_score >= 70:

            payment = await release_salary(
                employee_name=row["full_name"],
                bank_account=row["bank_account"],
                amount=row["salary"]
            )

            results.append({
                "employee": row["full_name"],
                "status": "paid",
                "trust_score": trust_score,
                "payment": payment
            })

        else:

            results.append({
                "employee": row["full_name"],
                "status": "blocked",
                "reason": "High fraud risk detected",
                "trust_score": trust_score
            })

    return {
        "summary": {
            "total_employees": len(results),
            "paid": len([r for r in results if r["status"] == "paid"]),
            "blocked": len([r for r in results if r["status"] == "blocked"])
        },
        "results": results
    }