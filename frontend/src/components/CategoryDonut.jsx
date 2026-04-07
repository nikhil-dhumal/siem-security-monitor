// ============================================================
// FILE: frontend/src/components/CategoryDonut.jsx
// SVG donut chart — event count per log category.
// Data from GET /api/logs/categories/?hours=N
// ============================================================

import Card, { CardTitle } from './common/Card.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMsg from './common/ErrorMsg.jsx';
import EmptyState from './common/EmptyState.jsx';
import { useCategories } from '../hooks/useLogs';

const PALETTE = [
  'var(--accent)',
  'var(--red)',
  'var(--orange)',
  'var(--yellow)',
  'var(--blue)',
  'var(--purple)',
  'var(--teal)',
  'var(--green)',
];

export function CategoryDonut({ hours }) {
  const { data, loading, error } = useCategories(hours);

  if (loading) return <Card style={{ height: 140 }}><Spinner /></Card>;
  if (error)   return <Card><ErrorMsg msg={error} /></Card>;
  if (!data?.length) return <Card><EmptyState message="No category data" /></Card>;

  const total  = data.reduce((a, d) => a + d.count, 0);
  const r      = 34;
  const circ   = 2 * Math.PI * r;
  let   offset = 0;

  return (
    <Card>
      <CardTitle>By category</CardTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Donut SVG */}
        <svg width={88} height={88} viewBox="0 0 88 88" style={{ flexShrink: 0 }}>
          {data.slice(0, 8).map((d, i) => {
            const dash = (d.count / total) * circ;
            const el = (
              <circle
                key={i}
                cx={44} cy={44} r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={13}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 44 44)"
              />
            );
            offset += dash;
            return el;
          })}
          <text
            x={44} y={42}
            textAnchor="middle"
            fontSize={12}
            fontWeight={500}
            fill="var(--text)"
            fontFamily="var(--font-head)"
          >
            {total.toLocaleString()}
          </text>
          <text
            x={44} y={52}
            textAnchor="middle"
            fontSize={8}
            fill="var(--text3)"
          >
            events
          </text>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
          {data.slice(0, 7).map((d, i) => (
            <div
              key={d.category}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        7,
                fontSize:   11,
                color:      'var(--text2)',
              }}
            >
              <span
                style={{
                  width:        7,
                  height:       7,
                  borderRadius: '50%',
                  background:   PALETTE[i % PALETTE.length],
                  display:      'inline-block',
                  flexShrink:   0,
                }}
              />
              <span style={{ flex: 1, fontSize: 10 }}>{d.category || 'unknown'}</span>
              <span style={{ color: PALETTE[i % PALETTE.length], fontWeight: 500, fontSize: 10 }}>
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// FILE: frontend/src/components/TopEventsBar.jsx
// Horizontal bar chart — top event_type values.
// Data from GET /api/logs/event-types/?hours=N
// ============================================================

import { useEventTypes } from '../hooks/useLogs';

export function TopEventsBar({ hours }) {
  const { data, loading, error } = useEventTypes(hours);

  if (loading) return <Card style={{ height: 180 }}><Spinner /></Card>;
  if (error)   return <Card><ErrorMsg msg={error} /></Card>;
  if (!data?.length) return <Card><EmptyState message="No event type data" /></Card>;

  const max = data[0]?.count || 1;

  return (
    <Card>
      <CardTitle>Top event types</CardTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.slice(0, 8).map(r => (
          <div
            key={r.event_type}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                width:        112,
                fontSize:     10,
                color:        'var(--text2)',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                flexShrink:   0,
              }}
            >
              {r.event_type}
            </span>
            <div
              style={{
                flex:         1,
                height:       4,
                background:   'var(--bg4)',
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  width:        `${Math.round((r.count / max) * 100)}%`,
                  height:       '100%',
                  background:   'var(--red)',
                  borderRadius: 2,
                  transition:   'width .6s ease',
                }}
              />
            </div>
            <span
              style={{
                width:     28,
                textAlign: 'right',
                fontSize:  10,
                fontWeight:500,
                color:     'var(--text)',
                flexShrink:0,
              }}
            >
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}