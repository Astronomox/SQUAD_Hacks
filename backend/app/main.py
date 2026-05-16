from fastapi import FastAPI
from app.config.database import engine, Base

from app.routes.payrollRoutes import router as payroll_router
from app.routes.disbursementRoutes import router as disbursement_router

app = FastAPI()


app.include_router(payroll_router)
app.include_router(disbursement_router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {"message": "VeriPay AI Running"}
