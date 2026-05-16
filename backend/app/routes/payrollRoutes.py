from fastapi import APIRouter, UploadFile, File
from app.controllers.payrollController import upload_payroll

router = APIRouter(
    prefix="/payroll",
    tags=["Payroll"]
)


@router.post("/upload")
async def upload_payroll_route(file: UploadFile = File(...)):
    return await upload_payroll(file)