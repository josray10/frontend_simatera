import { useAuth } from '@/utils/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />; // Redirect ke login jika belum login
  if (user.role !== requiredRole) return <Navigate to="/" />; // Redirect kalau role salah

  return children;
};

export default ProtectedRoute;
