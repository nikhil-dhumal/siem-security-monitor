import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { setDevRole } from '../../features/auth/authSlice';

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['viewer', 'simulator', 'rule_admin'] },
  { to: '/analytics', label: 'Analytics', roles: ['viewer', 'simulator', 'rule_admin'] },
  { to: '/history', label: 'History', roles: ['viewer', 'simulator', 'rule_admin'] },
  { to: '/simulation', label: 'Simulation', roles: ['simulator'] },
  { to: '/rules', label: 'Rules', roles: ['rule_admin'] },
];

const getRoleFromRoles = (roles) => {
  if (roles.length === 3) return 'all';
  if (roles.includes('rule_admin') && !roles.includes('simulator')) return 'rule_admin';
  if (roles.includes('simulator') && !roles.includes('rule_admin')) return 'simulator';
  return 'viewer';
};

const TopBar = ({ title }) => {
  const dispatch = useDispatch();
  const { roles = [], user } = useSelector((state) => state.auth);
  const currentRole = getRoleFromRoles(roles);

  const handleRoleChange = (e) => {
    dispatch(setDevRole(e.target.value));
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
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="viewer">Viewer</option>
              <option value="rule_admin">Rule Admin</option>
              <option value="simulator">Simulator</option>
              <option value="all">Full Access</option>
            </select>
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>
        <nav className="mt-4 flex gap-2">
          {navItems
            .filter((item) => item.roles.some((r) => roles.includes(r)))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </div>
    </div>
  );
};

export default TopBar;
