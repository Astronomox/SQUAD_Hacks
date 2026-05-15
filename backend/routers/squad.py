"""
Squad Router — all Squad API calls.
Virtual Accounts, Transfers, Balance, Simulate, Webhooks.
No ML logic here — pure payment API integration.
"""
import logging
import time

import httpx
from fastapi import APIRouter

from config import SQUAD_BASE, SQUAD_HEADERS
from models import EscrowRequest, LookupRequest, TransferRequest, SimulateRequest

logger = logging.getLogger("squad")

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


# ─── Virtual Account Escrow ────────────────────────────────────────────────────

@router.post("/create-escrow")
async def create_escrow(req: EscrowRequest):
    """Create a Squad Virtual Account to hold payroll funds in escrow."""
    customer_id = f"verifyai_{req.cycleId}_{int(time.time())}"
    payload = {
        "customer_identifier": customer_id,
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
    logger.info(f"create-escrow: cycle={req.cycleId} amount={req.totalAmount} employees={req.verifiedCount}")
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(f"{SQUAD_BASE}/virtual-account", headers=SQUAD_HEADERS, json=payload)
            data = resp.json()
            logger.info(f"create-escrow response: status={resp.status_code} body={str(data)[:200]}")
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
            logger.error(f"create-escrow error: {e}")
            return {"success": False, "error": str(e),
                    "escrowRef": f"SQ-{req.cycleId}-ERR", "amount": req.totalAmount}


# ─── Account Lookup ────────────────────────────────────────────────────────────

@router.post("/account-lookup")
async def account_lookup(req: LookupRequest):
    """Resolve bank account name before disbursement."""
    logger.info(f"account-lookup: bank={req.bankCode} account={req.accountNumber}")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.post(
                f"{SQUAD_BASE}/payout/account/lookup",
                headers=SQUAD_HEADERS,
                json={"bank_code": req.bankCode, "account_number": req.accountNumber}
            )
            return resp.json()
        except Exception as e:
            logger.error(f"account-lookup error: {e}")
            return {"success": False, "error": str(e)}


# ─── Salary Disbursement ───────────────────────────────────────────────────────

@router.post("/disburse")
async def disburse_salary(req: TransferRequest):
    """
    Disburse salary to a verified employee via Squad Transfer API.
    Amount in naira — converted to kobo string for Squad.
    Bank code auto-mapped to 6-digit NIP code.
    """
    txn_ref  = f"VERIFYAI_{req.employeeId}_{int(time.time())}"
    nip_code = NIP_CODES.get(req.bankCode, req.bankCode if len(req.bankCode) == 6 else "000013")
    amount_kobo = str(int(req.amount * 100))

    payload = {
        "transaction_reference": txn_ref,
        "amount":         amount_kobo,
        "bank_code":      nip_code,
        "account_number": req.accountNumber or "0123456789",
        "account_name":   req.accountName,
        "currency_id":    "NGN",
        "remark":         f"VerifyAI Salary - {req.employeeId} - {req.cycleId}"
    }
    logger.info(f"disburse: employee={req.employeeId} amount_naira={req.amount} kobo={amount_kobo} bank={nip_code}")
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(f"{SQUAD_BASE}/payout/transfer", headers=SQUAD_HEADERS, json=payload)
            result = resp.json()
            logger.info(f"disburse response: status={resp.status_code} ref={txn_ref}")
            return {"success": True, "txnRef": txn_ref, "squadResponse": result}
        except Exception as e:
            logger.error(f"disburse error: {e}")
            return {"success": False, "txnRef": txn_ref, "error": str(e)}


# ─── Transaction Verification ──────────────────────────────────────────────────

@router.get("/verify/{txn_ref}")
async def verify_transaction(txn_ref: str):
    """Verify a Squad transaction by reference."""
    logger.info(f"verify-transaction: ref={txn_ref}")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/transaction/verify/{txn_ref}", headers=SQUAD_HEADERS)
            return resp.json()
        except Exception as e:
            return {"error": str(e)}


# ─── Ledger Balance ────────────────────────────────────────────────────────────

@router.get("/balance")
async def get_balance():
    """Get merchant ledger balance. Returns both kobo and naira."""
    logger.info("get-balance called")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{SQUAD_BASE}/merchant/balance", headers=SQUAD_HEADERS)
            data = resp.json()
            logger.info(f"get-balance response: status={resp.status_code} data={str(data)[:200]}")
            kobo = data.get("data", {}).get("balance", 0)
            return {
                "success": True,
                "balance_kobo": kobo,
                "balance_naira": kobo / 100,
                "squadResponse": data
            }
        except Exception as e:
            logger.error(f"get-balance error: {e}")
            return {"success": False, "error": str(e)}


# ─── All Merchant Transactions ─────────────────────────────────────────────────

@router.get("/transactions")
async def get_transactions():
    """Get all merchant transactions."""
    logger.info("get-transactions called")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{SQUAD_BASE}/virtual-account/merchant/transactions",
                headers=SQUAD_HEADERS
            )
            data = resp.json()
            logger.info(f"get-transactions response: status={resp.status_code} keys={list(data.keys()) if isinstance(data, dict) else type(data)}")
            return data
        except Exception as e:
            logger.error(f"get-transactions error: {e}")
            return {"success": False, "error": str(e)}


# ─── VA Transactions by Customer ───────────────────────────────────────────────

@router.get("/va-transactions/{customer_identifier}")
async def get_va_transactions(customer_identifier: str):
    """Get transaction history for a specific virtual account customer."""
    logger.info(f"va-transactions: customer={customer_identifier}")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{SQUAD_BASE}/virtual-account/customer/transactions/{customer_identifier}",
                headers=SQUAD_HEADERS
            )
            return resp.json()
        except Exception as e:
            logger.error(f"va-transactions error: {e}")
            return {"success": False, "error": str(e)}


# ─── All Virtual Accounts ──────────────────────────────────────────────────────

@router.get("/virtual-accounts")
async def get_all_virtual_accounts():
    """List all virtual accounts for this merchant."""
    logger.info("get-virtual-accounts called")
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{SQUAD_BASE}/virtual-account/merchant/accounts",
                headers=SQUAD_HEADERS
            )
            data = resp.json()
            logger.info(f"get-virtual-accounts response: status={resp.status_code} keys={list(data.keys()) if isinstance(data, dict) else type(data)}")
            return data
        except Exception as e:
            logger.error(f"get-virtual-accounts error: {e}")
            return {"success": False, "error": str(e)}


# ─── Simulate Payment ──────────────────────────────────────────────────────────

@router.post("/simulate-payment")
async def simulate_payment(req: SimulateRequest):
    """
    Simulate a payment into a Virtual Account (sandbox only).
    Input: amount in NAIRA — backend converts to kobo string for Squad.
    Example: amount=500 sends "50000" kobo to Squad.
    """
    amount_kobo = str(int(float(req.amount) * 100))
    payload = {
        "virtual_account_number": req.virtual_account_number,
        "amount": amount_kobo
    }
    logger.info(
        f"simulate-payment: VA={req.virtual_account_number} "
        f"amount_naira={req.amount} amount_kobo={amount_kobo}"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(
                f"{SQUAD_BASE}/virtual-account/simulate/payment",
                headers=SQUAD_HEADERS,
                json=payload
            )
            result = resp.json()
            logger.info(f"simulate-payment response: status={resp.status_code} body={str(result)[:200]}")
            return result
        except Exception as e:
            logger.error(f"simulate-payment error: {e}")
            return {"success": False, "error": str(e)}


# ─── Webhook Error Log ─────────────────────────────────────────────────────────

@router.get("/webhook-errors")
async def get_webhook_errors():
    """Get all missed webhook notifications."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"{SQUAD_BASE}/virtual-account/webhook/logs",
                headers=SQUAD_HEADERS
            )
            return resp.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
