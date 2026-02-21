# HRMS Lite — Human Resource Management System

A lightweight, production-ready HR Management System built with **React + FastAPI + MongoDB**.

---

## 🚀 Live URLs

| Service | URL |
|---|---|
| Frontend | _Deploy to Vercel/Netlify and add here_ |
| Backend API | _Deploy to Render/Railway and add here_ |
| API Docs (Swagger) | `<backend-url>/docs` |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios, react-hot-toast |
| Backend | Python 3.11, FastAPI, Motor (async MongoDB driver) |
| Database | MongoDB (Atlas) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render  |

---

## ✅ Features

### Core
- **Employee Management** — Add, list, delete employees with ID, name, email, department
- **Attendance Tracking** — Mark Present/Absent per employee per date (unique constraint)
- **View Attendance** — Per-employee and all-records views

### Bonus
- 🎯 Filter attendance by date, status, employee
- 📊 Dashboard summary: total employees, present/absent today, department breakdown
- 📈 Total present days per employee displayed in employee list
- 🔍 Search employees by name, ID, or department

### UI States
- ✅ Loading states (spinner)
- ✅ Empty states (with CTAs)
- ✅ Error states (with retry)
- ✅ Toast notifications for all actions

---

## 🗂 Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── database.py          # MongoDB connection
│   │   ├── routes/
│   │   │   ├── employees.py     # Employee CRUD APIs
│   │   │   ├── attendance.py    # Attendance APIs
│   │   │   └── dashboard.py     # Summary stats
│   │   └── schemas/
│   │       └── schemas.py       # Pydantic models
│   ├── main.py                  # FastAPI app entry
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/index.js          # Axios API client
    │   ├── components/
    │   │   ├── ui/index.jsx      # Reusable UI components
    │   │   ├── layout/           # Sidebar, Layout
    │   │   ├── AddEmployeeModal.jsx
    │   │   └── MarkAttendanceModal.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Attendance.jsx
    │   │   └── NotFound.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🛠 Run Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works) OR local MongoDB

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your MongoDB connection string:
# MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hrms_lite
# DATABASE_NAME=hrms_lite

# Start server
uvicorn main:app --reload --port 8000
```

Backend will be live at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend will be live at: http://localhost:3000

---
## 🔌 API Endpoints

### Employees
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance` | All records (filterable) |
| GET | `/api/attendance/:employee_id` | Employee records (filterable) |
| POST | `/api/attendance` | Mark attendance |
| PUT | `/api/attendance/:id/:date` | Update attendance |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Summary stats |

---

## ⚠️ Assumptions & Limitations

- Single admin user — no authentication/login required
- One attendance record per employee per date (duplicate will return 409 Conflict)
- MongoDB Atlas free tier has storage limits (~512MB)
- Leave management, payroll, and advanced HR features are out of scope
- CORS is set to `*` in development — restrict to your frontend URL in production
