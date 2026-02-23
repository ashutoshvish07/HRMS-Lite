import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { useEmployees } from '../context/EmployeeContext';
import { StatCard, LoadingState, ErrorState } from '../components/ui';

export default function Dashboard() {
  const { summary, loading: dashLoading, error: dashError, fetchSummary } = useDashboard();
  const { employees, loading: empLoading, fetchEmployees } = useEmployees();

  // ✅ Only fetches if not already cached — no duplicate calls on tab switch
  useEffect(() => {
    fetchSummary();
    fetchEmployees();
  }, []);

  const loading = (dashLoading && !summary) || (empLoading && !employees.length);
  const error = dashError;

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error && !summary) return <ErrorState message={error} onRetry={() => fetchSummary(true)} />;
  if (!summary) return <LoadingState message="Loading dashboard..." />;

  const topEmployees = [...employees]
    .sort((a, b) => b.total_present - a.total_present)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview for{' '}
            {new Date(summary.today + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => { fetchSummary(true); fetchEmployees(true); }}
          className="btn-secondary text-xs py-2 px-3"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={summary.total_employees} icon="👥" color="brand" />
        <StatCard label="Present Today" value={summary.total_present_today} icon="✅" color="emerald" />
        <StatCard label="Absent Today" value={summary.total_absent_today} icon="❌" color="red" />
        <StatCard label="Total Records" value={summary.total_attendance_records} icon="📋" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-surface-800 mb-4">Departments</h2>
          {summary.departments.length === 0 ? (
            <p className="text-sm text-gray-400">No departments yet</p>
          ) : (
            <div className="space-y-3">
              {summary.departments.map((d) => (
                <div key={d.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-surface-800">{d.department}</span>
                    <span className="text-gray-400">{d.count} emp</span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${(d.count / summary.total_employees) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Employees by Attendance */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-surface-800 mb-4">Top Attendance</h2>
          {topEmployees.length === 0 ? (
            <p className="text-sm text-gray-400">No attendance data yet</p>
          ) : (
            <div className="space-y-3">
              {topEmployees.map((emp, i) => (
                <div key={emp.employee_id} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-gray-400 font-medium text-right">{i + 1}</span>
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 font-display font-bold text-sm">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">{emp.department}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{emp.total_present}d</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/employees" className="card p-5 flex items-center gap-4 hover:border-brand-500/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center text-xl group-hover:bg-brand-500 group-hover:text-white transition-all duration-200">👥</div>
          <div>
            <p className="font-semibold text-surface-800 text-sm">Manage Employees</p>
            <p className="text-xs text-gray-400">Add, view, or delete records</p>
          </div>
        </Link>
        <Link to="/attendance" className="card p-5 flex items-center gap-4 hover:border-brand-500/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">📋</div>
          <div>
            <p className="font-semibold text-surface-800 text-sm">Track Attendance</p>
            <p className="text-xs text-gray-400">Mark and view attendance</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
