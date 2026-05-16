from fastapi import APIRouter, Request

router = APIRouter(
    prefix="/location",
    tags=["Location"]
)


@router.post("/verify")
async def verify_location(request: Request):

    body = await request.json()

    latitude = body.get("latitude")
    longitude = body.get("longitude")
    ip = request.client.host

    return {
        "latitude": latitude,
        "longitude": longitude,
        "ip": ip,
        "status": "received"
    }