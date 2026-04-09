import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState } from '../features/auth/authSlice';

const ROLE_PRESETS = [
  {
    label: 'Viewer',
    description: 'Read-only dashboard and analytics access.',
    roles: ['viewer'],
  },
  {
    label: 'Simulator',
    description: 'Dashboard, analytics, and simulation controls.',
    roles: ['viewer', 'simulator'],
  },
  {
    label: 'Rule Administrator',
    description: 'Dashboard, analytics, and rule management.',
    roles: ['viewer', 'rule_admin'],
  },
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { initialized, isAuthenticated } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState(ROLE_PRESETS[0]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/');
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleLogin = () => {
    dispatch(
      setAuthState({
        user: { name: `${selectedRole.label} User` },
        token: 'dev-token',
        roles: selectedRole.roles,
      })
    );
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-white">SIEM Security Monitor</h1>
        <p className="mt-3 text-slate-400">Choose a role to sign in and preview role-based access.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ROLE_PRESETS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setSelectedRole(option)}
              className={`rounded-3xl border px-4 py-5 text-left transition ${
                selectedRole.label === option.label
                  ? 'border-sky-500 bg-slate-800 text-sky-100'
                  : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="mt-2 text-xs text-slate-400">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Selected role:</p>
            <p className="mt-1 text-lg font-semibold text-white">{selectedRole.label}</p>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            className="rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Sign in as {selectedRole.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
