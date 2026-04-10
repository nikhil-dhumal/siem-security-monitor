import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, initialized, roles = [] } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
    console.error('ProtectedRoute: Access Denied', { roles, allowedRoles });
    return (
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-10 text-center shadow">
          <h2 className="text-2xl font-semibold text-red-600">Access Denied</h2>
          <p className="mt-3 text-gray-600">Your roles: {JSON.stringify(roles)}</p>
          <p className="mt-3 text-gray-600">Required roles: {JSON.stringify(allowedRoles)}</p>
          <button
            onClick={handleLogout}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Logout & Choose Different Role
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
