import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authPath, gymPath } from '../paths';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-700 border-r-transparent"></div>
          <p className="mt-4 text-stone-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={authPath(`${location.pathname}${location.search}`)} replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to={gymPath('palestre')} replace />;
  }

  return <>{children}</>;
}
