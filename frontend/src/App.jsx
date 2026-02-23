import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { EmployeeProvider } from './context/EmployeeContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { DashboardProvider } from './context/DashboardContext';

// Layout & Pages
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      {/* 
        All providers sit at the top level so their state (and cache)
        persists across tab/route changes — no re-fetching on navigation.
      */}
      <EmployeeProvider>
        <AttendanceProvider>
          <DashboardProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </DashboardProvider>
        </AttendanceProvider>
      </EmployeeProvider>
    </BrowserRouter>
  );
}
