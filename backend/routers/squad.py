"""
Squad Router — all Squad API calls.
Virtual Accounts, Transfers, Balance, Simulate, Webhooks.
No ML logic here — pure payment API integration.
"""
from fastapi import APIRouter
import httpx
import time

from config import SQUAD_BASE, SQUAD_HEADERS
from models import EscrowRequest, LookupRequest, TransferRequest, SimulateRequest, EmployeeVARequest

router = APIRouter(prefix="/squad", tags=["Squad API"])

# NIP code map — 3-digit bank code to 6-digit NIP
NIP_CODES = {
    "058": "000013",  # GTBank
    "044": "000014",  # Access
    "011": "000016",  # First Bank
    "057": "000008",  # Zenith
    "033": "000004",  # UBA
    "050": "000002",  # EcoBank
    "032": "000009",  # Union Bank
    "035": "000017",  # Wema
    "076": "000027",  # Polaris
    "082": "000020",  # Keystone
}


# ─── Virtual Account Escrow ───────────────────────────────────────────────────

@router.post("/create-escrow")
async def create_escrow(req: EscrowRequest):
    """Create a Squad Virtual Account to hold payroll funds in escrow."""
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
            return {"success": False, "error": str(e),
                    "escrowRef": f"SQ-{req.cycleId}-ERR", "amount": req.totalAmount}


# ─── Account Lookup ───────────────────────────────────────────────────────────

@router.post("/account-lookup")
async def account_lookup(req: LookupRequest):
    """Resolve bank account name before disbursement."""
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


# ─── Salary Disbursement ──────────────────────────────────────────────────────

@router.post("/disburse")
async def disburse_salary(req: TransferRequest):
    """
    Disburse salary to a verified employee via Squad Transfer API.
    Amount in naira — converted to kobo string for Squad.
    Bank code auto-mapped to 6-digit NIP code.
    """
    txn_ref  = f"SB9GB7333N_{req.employeeId.replace('-','')}{int(time.time())}"
    nip_code = NIP_CODES.get(req.bankCode, req.bankCode if len(req.bankCode) == 6 else "000013")

    payload = {
        "transaction_reference": txn_ref,
        "amount":         str(int(req.amount * 100)),  # naira -> kobo string
        "bank_code":      nip_code,
        "account_number": req.accountNumber or "0123456789",
        "account_name":   req.accountName,
        "currency_id":    "NGN",
        "remark":         f"VerifyAI Salary - {req.employeeId} - {req.cycleId}"
    }
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(f"{SQUAD_BASE}/payout/transfer", headers=SQUAD_HEADERS, json=payload)
            return {"success": True, "txnRef": txn_ref, "squadResponse": resp.json()}
        except Exception as e:
            return {"success": False, "txnRef": txn_ref, "error": str(e)}


# ─── Transaction Verification ─────────────────────────────────────────────────

@router.get("/verify/{txn_ref}")
async def verify_transaction(txn_ref: str):
    """Verify a Squad transaction by reference."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/transaction/verify/{txn_ref}", headers=SQUAD_HEADERS)
            return resp.json()
        except Exception as e:
            return {"error": str(e)}


# ─── Ledger Balance ───────────────────────────────────────────────────────────

@router.get("/balance")
async def get_balance():
    """Get merchant ledger balance. Returns both kobo and naira."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/merchant/balance", headers=SQUAD_HEADERS)
            data = resp.json()
            kobo  = data.get("data", {}).get("balance", 0)
            return {"success": True, "balance_kobo": kobo, "balance_naira": kobo / 100, "squadResponse": data}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ─── Transactions ─────────────────────────────────────────────────────────────

@router.get("/transactions")
async def get_transactions():
    """Get all merchant transactions."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/virtual-account/merchant/transactions", headers=SQUAD_HEADERS)
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}


# ─── VA Transactions by Customer ─────────────────────────────────────────────

@router.get("/va-transactions/{customer_identifier}")
async def get_va_transactions(customer_identifier: str):
    """Get transaction history for a specific virtual account customer."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{SQUAD_BASE}/virtual-account/customer/transactions/{customer_identifier}",
                headers=SQUAD_HEADERS
            )
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}


# ─── All Virtual Accounts ─────────────────────────────────────────────────────

@router.get("/virtual-accounts")
async def get_all_virtual_accounts():
    """List all virtual accounts for this merchant."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/virtual-account/merchant/accounts", headers=SQUAD_HEADERS)
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}


# ─── Simulate Payment ─────────────────────────────────────────────────────────

@router.post("/simulate-payment")
async def simulate_payment(req: SimulateRequest):
    """
    Simulate a payment into a Virtual Account (sandbox only).
    Input: amount in NAIRA — backend converts to kobo string for Squad.
    Example: amount=500 sends "50000" kobo to Squad.
    """
    # Squad simulate/payment requires amount as STRING in kobo (no decimals)
    # Input: amount in naira (e.g. 500 = ₦500)
    # Output: "50000" (kobo)
    amount_kobo = str(int(float(req.amount) * 100))
    payload = {
        "virtual_account_number": req.virtual_account_number,
        "amount": amount_kobo
    }
    import logging
    logging.info(f"Simulate payment: VA={req.virtual_account_number} amount_naira={req.amount} amount_kobo={amount_kobo}")
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(
                f"{SQUAD_BASE}/virtual-account/simulate/payment",
                headers=SQUAD_HEADERS,
                json=payload
            )
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}


# ─── Webhook Error Log ────────────────────────────────────────────────────────

@router.get("/webhook-errors")
async def get_webhook_errors():
    """Get all missed webhook notifications."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/virtual-account/webhook/logs", headers=SQUAD_HEADERS)
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
