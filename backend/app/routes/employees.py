from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.schemas.schemas import EmployeeCreate, EmployeeResponse, MessageResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])


def serialize_employee(emp: dict, present: int = 0, absent: int = 0) -> dict:
    return {
        "id": str(emp["_id"]),
        "employee_id": emp["employee_id"],
        "full_name": emp["full_name"],
        "email": emp["email"],
        "department": emp["department"],
        "created_at": emp["created_at"].isoformat() if isinstance(emp["created_at"], datetime) else emp["created_at"],
        "total_present": present,
        "total_absent": absent,
    }


# GET /api/employees — list all employees with attendance summary
@router.get("/", response_model=list[EmployeeResponse])
async def get_all_employees():
    db = get_db()
    employees = await db.employees.find().sort("created_at", -1).to_list(None)

    result = []
    for emp in employees:
        emp_id = emp["employee_id"]
        present = await db.attendance.count_documents({"employee_id": emp_id, "status": "Present"})
        absent = await db.attendance.count_documents({"employee_id": emp_id, "status": "Absent"})
        result.append(serialize_employee(emp, present, absent))

    return result


# GET /api/employees/:id — single employee
@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    db = get_db()
    emp = await db.employees.find_one({"employee_id": employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    present = await db.attendance.count_documents({"employee_id": employee_id, "status": "Present"})
    absent = await db.attendance.count_documents({"employee_id": employee_id, "status": "Absent"})
    return serialize_employee(emp, present, absent)


# POST /api/employees — create employee
@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(payload: EmployeeCreate):
    db = get_db()

    # Check duplicate employee_id
    if await db.employees.find_one({"employee_id": payload.employee_id}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee ID '{payload.employee_id}' already exists"
        )

    # Check duplicate email
    if await db.employees.find_one({"email": payload.email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{payload.email}' is already registered"
        )

    doc = {
        "employee_id": payload.employee_id,
        "full_name": payload.full_name,
        "email": payload.email,
        "department": payload.department,
        "created_at": datetime.utcnow(),
    }
    result = await db.employees.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_employee(doc)


# DELETE /api/employees/:id — delete employee and cascade attendance
@router.delete("/{employee_id}", response_model=MessageResponse)
async def delete_employee(employee_id: str):
    db = get_db()
    emp = await db.employees.find_one({"employee_id": employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    await db.employees.delete_one({"employee_id": employee_id})
    await db.attendance.delete_many({"employee_id": employee_id})

    return {"message": f"Employee '{employee_id}' deleted successfully"}
