import { useStatsStream } from '../hooks/useWebSocket';
import { useSummary }     from '../hooks/useLogs';

// ── Individual metric card ───────────────────────────────────
function MetricCard({ label, value, sub, color, index, isLive }) {
  return (
    <div
      style={{
        background:   'var(--bg3)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding:      '11px 14px',
        animation:    `countUp .4s ease ${index * 0.06}s both`,
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Live indicator stripe */}
      {isLive && (
        <div
          style={{
            position:    'absolute',
            top:         0,
            left:        0,
            width:       '100%',
            height:      2,
            background:  'var(--accent)',
            opacity:     .4,
          }}
        />
      )}

      <div
        style={{
          fontSize:      10,
          color:         'var(--text3)',
          marginBottom:  6,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize:   22,
          fontWeight: 500,
          color,
          fontFamily: 'var(--font-head)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}

// ── Skeleton card shown while loading ───────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background:   'var(--bg3)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding:      '11px 14px',
        height:       76,
      }}
    >
      <div style={{ width: 60,  height: 8,  background: 'var(--bg5)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: 40,  height: 22, background: 'var(--bg5)', borderRadius: 4 }} />
    </div>
  );
}

export default function MetricCards({ hours }) {
  // Primary: WebSocket live stats
  const { stats, isConnected } = useStatsStream(hours);

  // Fallback: REST API (used while WS connects or if WS fails)
  const { data: restData, loading } = useSummary(hours);

  // Use WebSocket data if available, else fall back to REST
  const data = stats || restData;

  if (!data && loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total events',
      value: data?.total_events?.toLocaleString() ?? '—',
      sub:   `last ${hours}h`,
      color: 'var(--accent)',
    },
    {
      label: 'Unique source IPs',
      value: data?.unique_src_ips?.toLocaleString() ?? '—',
      sub:   'distinct origins',
      color: 'var(--red)',
    },
    {
      label: 'Unique hosts',
      value: data?.unique_hosts?.toLocaleString() ?? '—',
      sub:   'active hosts',
      color: 'var(--orange)',
    },
    {
      label: 'Failures / Blocks',
      value: data?.failure_count?.toLocaleString() ?? '—',
      sub:   'failed outcomes',
      color: 'var(--red)',
    },
    {
      label: 'Successes',
      value: data?.success_count?.toLocaleString() ?? '—',
      sub:   'allowed outcomes',
      color: 'var(--green)',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 10 }}>
      {metrics.map((m, i) => (
        <MetricCard
          key={m.label}
          index={i}
          isLive={isConnected}
          {...m}
        />
      ))}
    </div>
  );
}