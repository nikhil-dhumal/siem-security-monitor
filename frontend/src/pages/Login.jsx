import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState } from '../features/auth/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [userType, setUserType] = useState('viewer');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Get roles for selected user type
    const roles = getRolesForUserType(userType);
    
    // Create user object
    const user = {
      id: `user-${userType}`,
      username: userType,
      email: `${userType}@siem.local`,
    };

    // Update Redux state
    dispatch(setAuthState({ 
      user, 
      token: `mock-token-${userType}`, 
      roles 
    }));

    // Redirect based on user role
    if (userType === 'simulator') {
      navigate('/simulation');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-white">SIEM Security Monitor</h1>
        <p className="mt-3 text-slate-400">Select your user role to access the dashboard.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Role:
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="viewer">Viewer - Dashboard, Analytics, History</option>
              <option value="admin">Admin - Full Access (All Pages + Rules)</option>
              <option value="simulator">Simulator - Simulation Controls Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 active:bg-blue-800"
          >
            Enter Dashboard
          </button>
        </form>

        <div className="mt-8 space-y-3 rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
          <p className="font-medium text-slate-200">Permissions:</p>
          <ul className="space-y-1 text-slate-400">
            <li>• <span className="font-medium text-slate-300">Viewer:</span> View-only access</li>
            <li>• <span className="font-medium text-slate-300">Admin:</span> Full system access</li>
            <li>• <span className="font-medium text-slate-300">Simulator:</span> Test attack scenarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper function to get roles for user type
function getRolesForUserType(userType) {
  switch (userType) {
    case 'viewer':
      return ['viewer'];
    case 'admin':
      return ['viewer', 'admin'];
    case 'simulator':
      return ['simulator'];
    default:
      return ['viewer'];
  }
}

export default Login;