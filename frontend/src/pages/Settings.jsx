// ============================================================
// FILE: frontend/src/pages/Settings.jsx
// Settings page — API connection, environment variables,
// data source configuration.
// ============================================================

import Card, { CardTitle } from '../components/common/Card.jsx';

function SettingsRow({ label, value, mono = false }) {
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '8px 0',
        borderBottom:   '1px solid var(--border)',
        fontSize:       12,
        gap:            16,
      }}
    >
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span
        style={{
          color:      'var(--accent2)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          fontSize:   11,
          textAlign:  'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>

      <Card>
        <CardTitle>Connection</CardTitle>
        <SettingsRow label="Backend API"     value={import.meta.env.VITE_API_URL || 'http://localhost:8000'} mono />
        <SettingsRow label="Database"        value="PostgreSQL (via Django ORM)" />
        <SettingsRow label="Auto-refresh"    value="Every 30 seconds" />
        <SettingsRow label="Geo resolution"  value="ip-api.com batch API" />
        <SettingsRow label="Log model"       value="services/backend/logs/models.py" mono />
      </Card>

      <Card>
        <CardTitle>Environment variables</CardTitle>
        <SettingsRow label="VITE_API_URL"   value="Django backend base URL" mono />
        <SettingsRow label="VITE_APP_TITLE" value="Page title (optional)"   mono />
        <div
          style={{
            marginTop:    10,
            fontSize:     11,
            color:        'var(--text3)',
            lineHeight:   1.7,
          }}
        >
          Create <span style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>frontend/.env</span> and
          set <span style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>VITE_API_URL</span> to your
          Django server URL before running <span style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>npm run dev</span>.
        </div>
      </Card>

      <Card>
        <CardTitle>API endpoints</CardTitle>
        {[
          ['/api/logs/',             'Paginated log list (filterable)'],
          ['/api/logs/summary/',     'KPI metric cards'],
          ['/api/logs/timeline/',    'Events-over-time sparkline'],
          ['/api/logs/categories/',  'Category donut chart'],
          ['/api/logs/event-types/', 'Top event types bar'],
          ['/api/logs/outcomes/',    'Outcome distribution'],
          ['/api/logs/geo/',         'World threat map IPs'],
          ['/api/logs/top-ips/',     'Top source IPs table'],
          ['/api/logs/top-hosts/',   'Top hosts analytics'],
          ['/api/logs/top-users/',   'Top users analytics'],
        ].map(([ep, desc]) => (
          <div
            key={ep}
            style={{
              display:      'flex',
              gap:          16,
              padding:      '5px 0',
              borderBottom: '1px solid var(--border)',
              fontSize:     11,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color:      'var(--accent2)',
                width:      200,
                flexShrink: 0,
                fontSize:   10,
              }}
            >
              {ep}
            </span>
            <span style={{ color: 'var(--text3)' }}>{desc}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}