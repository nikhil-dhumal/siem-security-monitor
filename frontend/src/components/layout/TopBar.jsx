import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['viewer', 'admin'] },
  { to: '/analytics', label: 'Analytics', roles: ['viewer', 'admin'] },
  { to: '/records', label: 'History', roles: ['viewer', 'admin'] },
  { to: '/simulation', label: 'Simulation', roles: ['simulator'] },
  { to: '/rules', label: 'Rules', roles: ['admin'] },
];

const TopBar = ({ title }) => {
  const dispatch = useDispatch();
  const { roles = [], user } = useSelector((state) => state.auth);

  const visibleNavItems = navItems.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <div className="mb-6 border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">SIEM Security Monitor Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;