import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, initialized, roles = [] } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-10 text-center shadow">
          <h2 className="text-2xl font-semibold">Loading authentication...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasRole = allowedRoles.length === 0 || allowedRoles.some((role) => roles.includes(role));
  if (!hasRole) {
    return (
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-10 text-center shadow">
          <h2 className="text-2xl font-semibold text-red-600">Access Denied</h2>
          <p className="mt-3 text-gray-600">Your account does not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
