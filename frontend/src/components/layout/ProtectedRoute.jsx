/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
