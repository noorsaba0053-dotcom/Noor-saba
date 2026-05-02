import { Navigate, Outlet } from 'react-router-dom';
import { User } from 'firebase/auth';

interface ProtectedRouteProps {
  user: User | null;
  loading: boolean;
}

export default function ProtectedRoute({ user, loading }: ProtectedRouteProps) {
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
