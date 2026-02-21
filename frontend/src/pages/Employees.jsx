import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { employeeAPI } from '../api';
import { LoadingState, ErrorState, EmptyState, ConfirmDialog } from '../components/ui';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { Link } from 'react-router-dom';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async (form) => {
    const emp = await employeeAPI.create(form);
    setEmployees((prev) => [emp, ...prev]);
    toast.success(`Employee ${emp.full_name} added successfully!`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeAPI.delete(deleteTarget.employee_id);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== deleteTarget.employee_id));
      toast.success(`Employee ${deleteTarget.full_name} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">Employees</h1>
          <p className="text-sm text-gray-400 mt-1">{employees.length} total employees</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <span>+</span> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, or department..."
          className="input-field pl-10"
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading employees..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : filtered.length === 0 ? (
        search ? (
          <div className="card py-16 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold text-surface-800">No results for "{search}"</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="card">
            <EmptyState
              icon="👥"
              title="No employees yet"
              description="Add your first employee to get started with the HR management system."
              action={
                <button onClick={() => setShowAdd(true)} className="btn-primary">
                  + Add First Employee
                </button>
              }
            />
          </div>
        )
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Employee</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">ID</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Department</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Attendance</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Joined</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((emp) => (
                <tr key={emp.employee_id} className="hover:bg-surface-50/60 transition-colors duration-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 font-display font-bold text-sm flex items-center justify-center">
                        {emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-surface-800 text-sm">{emp.full_name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-surface-100 text-surface-800 px-2 py-1 rounded-lg font-mono">
                      {emp.employee_id}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-800 bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-xs font-medium">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        ✅ {emp.total_present}
                      </span>
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        ❌ {emp.total_absent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400">
                      {new Date(emp.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/attendance?employee=${emp.employee_id}`}
                        className="text-xs text-brand-500 hover:text-brand-600 font-medium hover:underline"
                      >
                        View Attendance
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="btn-danger py-1.5 px-3 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleCreate}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.full_name}? This will also remove all their attendance records. This action cannot be undone.`}
      />
    </div>
  );
}
