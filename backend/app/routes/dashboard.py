from fastapi import APIRouter
from app.database import get_db
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_summary():
    db = get_db()
    today = date.today().isoformat()

    total_employees = await db.employees.count_documents({})
    total_present_today = await db.attendance.count_documents({"date": today, "status": "Present"})
    total_absent_today = await db.attendance.count_documents({"date": today, "status": "Absent"})
    total_attendance_records = await db.attendance.count_documents({})

    # Department breakdown
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    dept_cursor = db.employees.aggregate(pipeline)
    departments = [{"department": d["_id"], "count": d["count"]} async for d in dept_cursor]

    return {
        "total_employees": total_employees,
        "total_present_today": total_present_today,
        "total_absent_today": total_absent_today,
        "total_attendance_records": total_attendance_records,
        "today": today,
        "departments": departments,
    }
