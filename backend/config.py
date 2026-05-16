import os
from dotenv import load_dotenv

load_dotenv()

SQUAD_SECRET  = os.getenv("SQUAD_SECRET", "sandbox_sk_a5b7f02908547633e42760ecb16f6b494527b5dd7946")
SQUAD_BASE    = "https://sandbox-api-d.squadco.com"
SQUAD_HEADERS = {
    "Authorization": f"Bearer {SQUAD_SECRET}",
    "Content-Type":  "application/json"
}
MERCHANT_ID  = "SB9GB7333N"
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://verifyai-hr.vercel.app")