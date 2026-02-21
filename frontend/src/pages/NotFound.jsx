import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-8xl font-display font-black text-surface-200 mb-4">404</p>
      <h1 className="font-display text-2xl font-bold text-surface-800 mb-2">Page not found</h1>
      <p className="text-sm text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">← Back to Dashboard</Link>
    </div>
  );
}
