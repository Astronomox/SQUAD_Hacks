from fastapi import APIRouter, UploadFile, File

from app.controllers.disbursementController import disburse_payroll

router = APIRouter(
    prefix="/payroll",
    tags=["Disbursement"]
)


@router.post("/disburse")
async def disburse_payroll_route(
    file: UploadFile = File(...)
):
    return await disburse_payroll(file)