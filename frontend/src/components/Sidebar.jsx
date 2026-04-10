import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', roles: ['viewer', 'admin', 'simulator'] },
  { label: 'Analytics', path: '/analytics', roles: ['viewer', 'admin'] },
  { label: 'History', path: '/records', roles: ['viewer', 'admin'] },
  { label: 'Simulation', path: '/simulation', roles: ['simulator'] },
  { label: 'Rules', path: '/rules', roles: ['admin'] },
];

const Sidebar = ({ active }) => {
  const roles = useSelector((state) => state.auth.roles);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  return (
    <aside className="w-56 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-2">
      <div className="text-sky-400 font-bold text-lg mb-6 px-2">SIEM</div>
      {visibleItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            active === item.label.toLowerCase()
              ? 'bg-sky-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;