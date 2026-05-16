def calculate_trust_score(
    liveness_verified: bool,
    anomaly_score: float,
    verified_device: bool
):
    score = 0

    if liveness_verified:
        score += 50

    if verified_device:
        score += 20

    score += max(0, 30 - anomaly_score)

    return min(score, 100)