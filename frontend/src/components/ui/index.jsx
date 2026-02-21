// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <div className={`${s} border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin`} />
  );
}

// ── Loading Page ──────────────────────────────────────────────────────────────
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4 text-3xl">
        {icon || '📭'}
      </div>
      <h3 className="font-display text-lg font-semibold text-surface-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-3xl">
        ⚠️
      </div>
      <h3 className="font-display text-lg font-semibold text-red-600 mb-1">Something went wrong</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try Again
        </button>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (status === 'Present')
    return <span className="badge-present">● Present</span>;
  return <span className="badge-absent">● Absent</span>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10
                      animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-surface-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl
                     transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {loading ? <Spinner size="sm" /> : null}
          Delete
        </button>
      </div>
    </Modal>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-500',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-500',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="font-display text-2xl font-bold text-surface-800">{value}</p>
      </div>
    </div>
  );
}
