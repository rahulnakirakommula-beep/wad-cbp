import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/ui/PageLoader';

/**
 * RouteGuard implements the logic specified in Section 1.2 of the UI/UX spec.
 * It handles JWT presence, onboarding status, and role-based access.
 */
export default function RouteGuard({ children, requiredRole, allowUnonboarded = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  // 1. No JWT present (No user in context)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. JWT present but onboarding incomplete (unless explicitly allowed)
  // SRS 1.2: Admins and Organisations bypass student onboarding requirements.
  const isSpecialRole = user.role === 'admin' || user.role === 'source';
  
  if (!user.onboardingComplete && !allowUnonboarded && location.pathname !== '/onboarding' && !isSpecialRole) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Suspended check (placeholder for future implementation)
  if (user.status === 'suspended') {
    return <Navigate to="/suspended" replace />;
  }

  // 4. Role enforcement
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to the appropriate home for their role
    const homePath = user.role === 'admin' ? '/admin' : '/app/feed';
    // We should show a toast here, but the Toast system is in next step
    return <Navigate to={homePath} replace />;
  }

  return children;
}
