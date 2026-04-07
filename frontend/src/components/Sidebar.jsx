import LiveDot from './common/LiveDot.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: '⬡' },
  { id: 'logs',      label: 'Log Explorer', icon: '≡' },
  { id: 'geomap',    label: 'Threat Map',   icon: '◉' },
  { id: 'analytics', label: 'Analytics',    icon: '∿' },
  { id: 'settings',  label: 'Settings',     icon: '⊕' },
];

export default function Sidebar({ active, onNav }) {
  return (
    <aside
      style={{
        width:         190,
        flexShrink:    0,
        background:    'var(--bg2)',
        borderRight:   '1px solid var(--border)',
        display:       'flex',
        flexDirection: 'column',
        height:        '100vh',
        position:      'sticky',
        top:           0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding:      '20px 16px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontFamily:    'var(--font-head)',
            fontSize:      16,
            fontWeight:    700,
            color:         'var(--accent)',
            letterSpacing: 3,
          }}
        >
          SIEM
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
          Security Monitor
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex:          1,
          padding:       '10px 8px',
          display:       'flex',
          flexDirection: 'column',
          gap:           2,
        }}
      >
        {NAV_ITEMS.map(n => {
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         10,
                padding:     '8px 10px',
                borderRadius:'var(--radius)',
                fontSize:    12,
                width:       '100%',
                textAlign:   'left',
                color:       isActive ? 'var(--accent)' : 'var(--text2)',
                background:  isActive ? 'rgba(0,229,255,.07)' : 'transparent',
                borderLeft:  isActive
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                transition:  'all .15s',
              }}
            >
              <span style={{ fontSize: 14, opacity: .75, flexShrink: 0 }}>
                {n.icon}
              </span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge && (
                <span
                  style={{
                    background:   'var(--red)',
                    color:        '#fff',
                    fontSize:     9,
                    padding:      '1px 5px',
                    borderRadius: 99,
                    fontWeight:   600,
                  }}
                >
                  {n.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div
        style={{
          padding:    '12px 16px',
          borderTop:  '1px solid var(--border)',
          fontSize:   10,
          color:      'var(--text3)',
          display:    'flex',
          flexDirection: 'column',
          gap:        6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LiveDot />
          <span>PostgreSQL connected</span>
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 9 }}>
          Auto-refresh · 30 s
        </div>
      </div>
    </aside>
  );
}