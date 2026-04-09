import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['viewer', 'simulator', 'rule_admin'] },
  { to: '/analytics', label: 'Analytics', roles: ['viewer', 'simulator', 'rule_admin'] },
  { to: '/simulation', label: 'Simulation', roles: ['simulator'] },
  { to: '/rules', label: 'Rules', roles: ['rule_admin'] },
];

const Sidebar = ({ active }) => {
  const roles = useSelector((state) => state.auth.roles || []);
  const visibleItems = navItems.filter((item) => item.roles.some((role) => roles.includes(role)));

  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-800 bg-slate-950 p-6 md:block">
      <div className="mb-10">
        <div className="text-2xl font-bold text-white">SIEM Monitor</div>
        <p className="mt-2 max-w-sm text-sm text-slate-400">Security operations, real-time detection and simulation controls in one panel.</p>
      </div>
      <nav className="space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-slate-800 text-sky-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
