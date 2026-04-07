// ============================================================
// FILE: frontend/src/components/TopBar.jsx
// Top header bar — live clock, time-window buttons, search.
// Props:
//   hours         — currently selected time window
//   onHoursChange — callback when user picks a different window
// ============================================================

import { useState, useEffect } from 'react';
import LiveDot from './common/LiveDot.jsx';

const TIME_OPTIONS = [
  { value: 6,   label: '6 h'  },
  { value: 24,  label: '24 h' },
  { value: 48,  label: '48 h' },
  { value: 168, label: '7 d'  },
];

export default function TopBar({ hours, onHoursChange }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      style={{
        height:         46,
        borderBottom:   '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 18px',
        background:     'var(--bg2)',
        flexShrink:     0,
        gap:            16,
      }}
    >
      {/* Left: live indicator + time window selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LiveDot />
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>Live</span>

        <span
          style={{
            width:      1,
            height:     14,
            background: 'var(--border2)',
            flexShrink: 0,
          }}
        />

        {TIME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onHoursChange(opt.value)}
            style={{
              fontSize:     10,
              padding:      '2px 10px',
              borderRadius: 99,
              border:       `1px solid ${hours === opt.value ? 'var(--accent)' : 'var(--border)'}`,
              color:        hours === opt.value ? 'var(--accent)' : 'var(--text3)',
              background:   hours === opt.value ? 'rgba(0,229,255,.08)' : 'transparent',
              transition:   'all .15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Right: clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontSize:    11,
            color:       'var(--text3)',
            fontFamily:  'var(--font-mono)',
          }}
        >
          {time}
        </span>
      </div>
    </header>
  );
}