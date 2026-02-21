import { useState } from 'react';
import { Modal, Spinner } from './ui';
import { format } from 'date-fns';

export default function MarkAttendanceModal({ isOpen, onClose, onSubmit, employees }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({ employee_id: '', date: today, status: 'Present' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = 'Please select an employee';
    if (!form.date) e.date = 'Date is required';
    if (!form.status) e.status = 'Status is required';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ employee_id: '', date: today, status: 'Present' });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ employee_id: '', date: today, status: 'Present' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark Attendance">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.api && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {errors.api}
          </div>
        )}

        <div>
          <label className="label">Employee</label>
          <select
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            className={`input-field ${errors.employee_id ? 'border-red-400 focus:ring-red-400' : ''}`}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
          {errors.employee_id && (
            <p className="text-xs text-red-500 mt-1">{errors.employee_id}</p>
          )}
        </div>

        <div>
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={`input-field ${errors.date ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="label">Status</label>
          <div className="flex gap-3">
            {['Present', 'Absent'].map((s) => (
              <label
                key={s}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all duration-150 ${
                  form.status === s
                    ? s === 'Present'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-red-400 bg-red-50 text-red-600'
                    : 'border-surface-200 bg-white text-gray-400 hover:border-surface-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={form.status === s}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span>{s === 'Present' ? '✅' : '❌'}</span>
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : null}
            Mark Attendance
          </button>
        </div>
      </form>
    </Modal>
  );
}
