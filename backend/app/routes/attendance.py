from fastapi import APIRouter, HTTPException, Query, status
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.schemas.schemas import AttendanceCreate, AttendanceResponse, MessageResponse

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def serialize_attendance(rec: dict, employee_name: Optional[str] = None) -> dict:
    return {
        "id": str(rec["_id"]),
        "employee_id": rec["employee_id"],
        "employee_name": employee_name,
        "date": rec["date"],
        "status": rec["status"],
        "created_at": rec["created_at"].isoformat() if isinstance(rec["created_at"], datetime) else rec["created_at"],
    }


# POST /api/attendance — mark attendance (upsert: one record per employee per day)
@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(payload: AttendanceCreate):
    db = get_db()

    # Verify employee exists
    emp = await db.employees.find_one({"employee_id": payload.employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check if record already exists for this employee+date
    existing = await db.attendance.find_one(
        {"employee_id": payload.employee_id, "date": payload.date}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already marked for employee '{payload.employee_id}' on {payload.date}. Use PUT to update."
        )

    doc = {
        "employee_id": payload.employee_id,
        "date": payload.date,
        "status": payload.status,
        "created_at": datetime.utcnow(),
    }
    result = await db.attendance.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_attendance(doc, emp["full_name"])


# PUT /api/attendance/:employee_id/:date — update existing attendance
@router.put("/{employee_id}/{date}", response_model=AttendanceResponse)
async def update_attendance(employee_id: str, date: str, payload: AttendanceCreate):
    db = get_db()

    emp = await db.employees.find_one({"employee_id": employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    result = await db.attendance.find_one_and_update(
        {"employee_id": employee_id, "date": date},
        {"$set": {"status": payload.status}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    return serialize_attendance(result, emp["full_name"])


# GET /api/attendance/:employee_id — get attendance for one employee, optional date filter
@router.get("/{employee_id}", response_model=list[AttendanceResponse])
async def get_employee_attendance(
    employee_id: str,
    date: Optional[str] = Query(None, description="Filter by date YYYY-MM-DD"),
    status: Optional[str] = Query(None, description="Filter by status: Present | Absent"),
):
    db = get_db()

    emp = await db.employees.find_one({"employee_id": employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    query: dict = {"employee_id": employee_id}
    if date:
        query["date"] = date
    if status and status in ("Present", "Absent"):
        query["status"] = status

    records = await db.attendance.find(query).sort("date", -1).to_list(None)
    return [serialize_attendance(r, emp["full_name"]) for r in records]


# GET /api/attendance — get all attendance records with optional date filter (dashboard use)
@router.get("/", response_model=list[AttendanceResponse])
async def get_all_attendance(
    date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    db = get_db()
    query: dict = {}
    if date:
        query["date"] = date
    if status and status in ("Present", "Absent"):
        query["status"] = status

    records = await db.attendance.find(query).sort("date", -1).to_list(None)

    # Enrich with employee names
    result = []
    for r in records:
        emp = await db.employees.find_one({"employee_id": r["employee_id"]})
        name = emp["full_name"] if emp else None
        result.append(serialize_attendance(r, name))
    return result
