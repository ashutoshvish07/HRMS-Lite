import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: '▦', label: 'Dashboard', end: true },
  { to: '/employees', icon: '👥', label: 'Employees' },
  { to: '/attendance', icon: '📋', label: 'Attendance' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-surface-900 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-display font-bold text-base">
            H
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">HRMS Lite</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-xs text-gray-600">HRMS Lite v1.0.0</p>
      </div>
    </aside>
  );
}
