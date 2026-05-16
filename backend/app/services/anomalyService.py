def detect_anomaly(bank_account_duplicates: int):

    risk = 0

    if bank_account_duplicates > 1:
        risk += 40

    if bank_account_duplicates > 3:
        risk += 30

    return risk