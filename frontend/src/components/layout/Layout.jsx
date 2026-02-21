import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 max-w-[1200px]">
        <Outlet />
      </main>
    </div>
  );
}
