import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAttendance } from '../context/AttendanceContext';
import { useEmployees } from '../context/EmployeeContext';
import { useDashboard } from '../context/DashboardContext';
import { LoadingState, ErrorState, EmptyState, StatusBadge } from '../components/ui';
import MarkAttendanceModal from '../components/MarkAttendanceModal';

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const { fetchAttendance, getCached, markAttendance, loading, error } = useAttendance();
  const { employees, fetchEmployees } = useEmployees();
  const { invalidate: invalidateDashboard } = useDashboard();

  const [records, setRecords] = useState([]);
  const [showMark, setShowMark] = useState(false);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState(searchParams.get('employee') || '');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ✅ Only fetches employees if not already cached
  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Fetch attendance only when filters change — uses cache when available
  const loadAttendance = useCallback(async (force = false) => {
    const params = {};
    if (filterDate) params.date = filterDate;
    if (filterStatus) params.status = filterStatus;

    // Check cache first
    if (!force) {
      const cached = getCached(filterEmployee, params);
      if (cached) {
        setRecords(cached);
        return;
      }
    }

    try {
      const data = await fetchAttendance(filterEmployee, params, force);
      if (data) setRecords(data);
    } catch (err) {
      toast.error(err.message);
    }
  }, [filterEmployee, filterDate, filterStatus, fetchAttendance, getCached]);

  useEffect(() => {
    loadAttendance();
  }, [filterEmployee, filterDate, filterStatus]);

  const handleMark = async (form) => {
    await markAttendance(form);
    invalidateDashboard();
    toast.success('Attendance marked successfully!');
    // Force refresh current view after marking
    loadAttendance(true);
  };

  const clearFilters = () => {
    setFilterEmployee('');
    setFilterDate('');
    setFilterStatus('');
  };

  const hasFilters = filterEmployee || filterDate || filterStatus;

  // Group by date for the "all employees" view
  const groupedByDate = records.reduce((acc, rec) => {
    acc[rec.date] = acc[rec.date] || [];
    acc[rec.date].push(rec);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">Attendance</h1>
          <p className="text-sm text-gray-400 mt-1">{records.length} records found</p>
        </div>
        <button onClick={() => setShowMark(true)} className="btn-primary">
          <span>+</span> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="label text-xs">Employee</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="input-field text-sm py-2"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="label text-xs">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="label text-xs">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field text-sm py-2"
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary py-2 text-sm h-[42px]">
              Clear Filters
            </button>
          )}

          <button
            onClick={() => loadAttendance(true)}
            className="btn-secondary py-2 text-sm h-[42px]"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && !records.length ? (
        <LoadingState message="Loading attendance records..." />
      ) : error && !records.length ? (
        <ErrorState message={error} onRetry={() => loadAttendance(true)} />
      ) : records.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="📋"
            title="No attendance records"
            description={
              hasFilters
                ? 'No records match your filters. Try clearing them.'
                : 'Start by marking attendance for your employees.'
            }
            action={
              <div className="flex gap-3">
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
                )}
                <button onClick={() => setShowMark(true)} className="btn-primary">
                  + Mark Attendance
                </button>
              </div>
            }
          />
        </div>
      ) : filterEmployee ? (
        // Single employee view — flat table
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-3">
            {(() => {
              const emp = employees.find((e) => e.employee_id === filterEmployee);
              return emp ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 font-display font-bold text-sm flex items-center justify-center">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-800 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">{emp.department} · {records.length} records</p>
                  </div>
                  <div className="ml-auto flex gap-3">
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                      ✅ {records.filter((r) => r.status === 'Present').length} Present
                    </span>
                    <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">
                      ❌ {records.filter((r) => r.status === 'Absent').length} Absent
                    </span>
                  </div>
                </>
              ) : null;
            })()}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Day</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-surface-800">{rec.date}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={rec.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // All employees — grouped by date
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="card overflow-hidden">
              <div className="px-6 py-3 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold text-surface-800 text-sm">{date}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    ✅ {groupedByDate[date].filter((r) => r.status === 'Present').length}
                  </span>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    ❌ {groupedByDate[date].filter((r) => r.status === 'Absent').length}
                  </span>
                </div>
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-surface-100">
                  {groupedByDate[date].map((rec) => (
                    <tr key={rec.id} className="hover:bg-surface-50/60 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center">
                            {rec.employee_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-800">{rec.employee_name || rec.employee_id}</p>
                            <p className="text-xs text-gray-400 font-mono">{rec.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={rec.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <MarkAttendanceModal
        isOpen={showMark}
        onClose={() => setShowMark(false)}
        onSubmit={handleMark}
        employees={employees}
      />
    </div>
  );
}
