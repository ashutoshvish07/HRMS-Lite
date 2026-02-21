import { useState } from 'react';
import { Modal, Spinner } from './ui';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Customer Support',
];

const INITIAL = { employee_id: '', full_name: '', email: '', department: '' };

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = 'Employee ID is required';
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.department) e.department = 'Department is required';
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
      setForm(INITIAL);
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.api && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {errors.api}
          </div>
        )}

        <div>
          <label className="label">Employee ID</label>
          <input
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            placeholder="e.g. EMP001"
            className={`input-field ${errors.employee_id ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          {errors.employee_id && (
            <p className="text-xs text-red-500 mt-1">{errors.employee_id}</p>
          )}
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="e.g. Jane Smith"
            className={`input-field ${errors.full_name ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          {errors.full_name && (
            <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@company.com"
            className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="label">Department</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className={`input-field ${errors.department ? 'border-red-400 focus:ring-red-400' : ''}`}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.department && (
            <p className="text-xs text-red-500 mt-1">{errors.department}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : null}
            Add Employee
          </button>
        </div>
      </form>
    </Modal>
  );
}
