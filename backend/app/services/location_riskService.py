def calculate_location_risk(
    country: str,
    office_country: str = "Nigeria"
):

    risk = 0
    reasons = []

    if country != office_country:
        risk += 40
        reasons.append("Verification attempted outside approved country")

    return {
        "risk_score": risk,
        "reasons": reasons
    }