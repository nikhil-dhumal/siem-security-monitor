import { useState } from 'react';
import { useLogStream } from '../hooks/useWebSocket';

// Colour map for log categories and outcomes
const CATEGORY_COLOR = {
  auth:      '#651fff',
  network:   '#2979ff',
  endpoint:  '#ff6b35',
  file:      '#ffc107',
  process:   '#1de9b6',
  dns:       '#00e5ff',
  web:       '#00e676',
};

const OUTCOME_COLOR = {
  failure: '#ff3d57',
  failed:  '#ff3d57',
  blocked: '#ff6b35',
  denied:  '#ff6b35',
  success: '#00e676',
  allow:   '#00e676',
  allowed: '#00e676',
};

function getCategoryColor(category) {
  return CATEGORY_COLOR[category?.toLowerCase()] || '#7a90a8';
}

function getOutcomeColor(outcome) {
  return OUTCOME_COLOR[outcome?.toLowerCase()] || '#7a90a8';
}

function formatTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString();
}

function LogRow({ log, isNew }) {
  const catColor     = getCategoryColor(log.category);
  const outcomeColor = getOutcomeColor(log.outcome);

  return (
    <div
      style={{
        border:       `1px solid ${isNew ? 'rgba(0,230,118,.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding:      '7px 10px',
        background:   isNew ? 'rgba(0,230,118,.04)' : 'transparent',
        animation:    isNew ? 'fadeUp .3s ease' : 'none',
        transition:   'border-color .3s',
      }}
    >
      {/* Top row: time + category badge + outcome */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        7,
          marginBottom: 3,
          fontSize:   10,
        }}
      >
        <span style={{ color: 'var(--text3)' }}>{formatTime(log.timestamp)}</span>
        <span
          style={{
            background:   catColor + '22',
            color:        catColor,
            border:       `1px solid ${catColor}44`,
            padding:      '1px 6px',
            borderRadius: 99,
            fontSize:     9,
            fontWeight:   500,
          }}
        >
          {log.category || 'unknown'}
        </span>
        {log.outcome && (
          <span style={{ color: outcomeColor, fontSize: 10 }}>
            {log.outcome}
          </span>
        )}
        {isNew && (
          <span
            style={{
              marginLeft:   'auto',
              background:   'rgba(0,230,118,.15)',
              color:        '#00e676',
              fontSize:     9,
              padding:      '1px 6px',
              borderRadius: 99,
              fontWeight:   500,
            }}
          >
            NEW
          </span>
        )}
      </div>

      {/* Event type */}
      <div
        style={{
          fontSize:     11,
          fontWeight:   500,
          color:        'var(--text)',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          marginBottom: 2,
        }}
      >
        {log.event_type || '—'}
      </div>

      {/* Source info row */}
      <div
        style={{
          display:  'flex',
          gap:      10,
          fontSize: 10,
          color:    'var(--text3)',
        }}
      >
        {log.src_ip && (
          <span style={{ fontFamily: 'var(--font-mono)', color: '#0099bb' }}>
            {log.src_ip}
          </span>
        )}
        {log.host && <span>{log.host}</span>}
        {log.user && <span>user: {log.user}</span>}
      </div>
    </div>
  );
}

export default function LiveAlertFeed({ maxLogs = 30 }) {
  const { logs, isConnected } = useLogStream(maxLogs);
  const [filter, setFilter]   = useState('all');

  const filtered = filter === 'all'
    ? logs
    : logs.filter(l => l.category?.toLowerCase() === filter);

  const categories = ['all', ...new Set(logs.map(l => l.category).filter(Boolean))];

  return (
    <div
      style={{
        background:   'var(--bg3)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding:      '12px 14px',
        display:      'flex',
        flexDirection:'column',
        gap:          10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize:      10,
            fontWeight:    500,
            color:         'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          Live log feed
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            {logs.length} events
          </span>
          {/* Connection status dot */}
          <span
            title={isConnected ? 'WebSocket connected' : 'WebSocket disconnected'}
            style={{
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:   isConnected ? '#00e676' : '#ff3d57',
              display:      'inline-block',
              animation:    isConnected ? 'pulse 2s infinite' : 'none',
            }}
          />
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                fontSize:     9,
                padding:      '2px 8px',
                borderRadius: 99,
                border:       `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`,
                color:        filter === cat ? 'var(--accent)' : 'var(--text3)',
                background:   filter === cat ? 'rgba(0,229,255,.08)' : 'transparent',
                transition:   'all .15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Not connected notice */}
      {!isConnected && (
        <div
          style={{
            fontSize:     10,
            color:        '#ff6b35',
            background:   'rgba(255,107,53,.08)',
            border:       '1px solid rgba(255,107,53,.2)',
            borderRadius: 'var(--radius)',
            padding:      '6px 10px',
          }}
        >
          ⚠ WebSocket disconnected — reconnecting…
        </div>
      )}

      {/* Log rows - scrollable container */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding:   20,
            textAlign: 'center',
            fontSize:  11,
            color:     'var(--text3)',
          }}
        >
          {isConnected ? 'Waiting for logs…' : 'Connecting to server…'}
        </div>
      ) : (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 5,
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {filtered.map((log, i) => (
            <LogRow key={log.id || i} log={log} isNew={i === 0 && isConnected} />
          ))}
        </div>
      )}
    </div>
  );
}