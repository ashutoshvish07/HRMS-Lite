import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwrap errors into readable messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail;
    let message = 'Something went wrong';
    if (typeof detail === 'string') message = detail;
    else if (Array.isArray(detail)) message = detail.map((d) => d.msg).join(', ');
    return Promise.reject(new Error(message));
  }
);

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll: () => api.get('/api/employees').then((r) => r.data),
  getOne: (id) => api.get(`/api/employees/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/employees', data).then((r) => r.data),
  delete: (id) => api.delete(`/api/employees/${id}`).then((r) => r.data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getByEmployee: (employee_id, params = {}) =>
    api.get(`/api/attendance/${employee_id}`, { params }).then((r) => r.data),
  getAll: (params = {}) =>
    api.get('/api/attendance', { params }).then((r) => r.data),
  mark: (data) => api.post('/api/attendance', data).then((r) => r.data),
  update: (employee_id, date, data) =>
    api.put(`/api/attendance/${employee_id}/${date}`, data).then((r) => r.data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary').then((r) => r.data),
};
