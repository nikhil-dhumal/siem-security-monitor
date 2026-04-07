// ============================================================
// FILE: frontend/src/components/SparklineChart.jsx
// Events-over-time line chart built with pure SVG (no deps).
// Data from GET /api/logs/timeline/?hours=N&bucket=hour
// Shows: line + area fill, peak marker, time-axis labels
// ============================================================

import Card, { CardTitle } from './common/Card.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMsg from './common/ErrorMsg.jsx';
import EmptyState from './common/EmptyState.jsx';
import { useTimeline } from '../hooks/useLogs';

function formatBucketLabel(bucketStr) {
  const dt = new Date(bucketStr);
  const h  = dt.getHours().toString().padStart(2, '0');
  const m  = dt.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function SparklineChart({ hours }) {
  const bucket                    = hours <= 48 ? 'hour' : 'day';
  const { data, loading, error }  = useTimeline(hours, bucket);

  if (loading) return <Card style={{ height: 128 }}><Spinner /></Card>;
  if (error)   return <Card><ErrorMsg msg={error} /></Card>;
  if (!data?.length) return <Card><EmptyState message="No timeline data" /></Card>;

  const W   = 620;
  const H   = 72;
  const max = Math.max(...data.map(d => d.count), 1);
  const n   = data.length;

  // SVG coordinate for each point
  const pts = data
    .map((d, i) => `${(i / (n - 1 || 1)) * W},${H - (d.count / max) * (H - 10)}`)
    .join(' ');

  // Peak point index
  const peakIdx = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);
  const peakX   = (peakIdx / (n - 1 || 1)) * W;
  const peakY   = H - (data[peakIdx].count / max) * (H - 10);

  // X-axis labels — show ~7 evenly distributed
  const labelStep = Math.ceil(n / 7);
  const labels    = data
    .filter((_, i) => i % labelStep === 0 || i === n - 1)
    .map((d, _, arr) => ({
      label: formatBucketLabel(d.bucket),
      x:     (data.indexOf(d) / (n - 1 || 1)) * W,
    }));

  return (
    <Card>
      <CardTitle right={`${n} buckets · per ${bucket}`}>
        Events over time
      </CardTitle>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H + 18}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity=".22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"  />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <polygon
          points={`0,${H} ${pts} ${W},${H}`}
          fill="url(#sparkGrad)"
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(pct => (
          <line
            key={pct}
            x1={0}
            y1={H - pct * (H - 10)}
            x2={W}
            y2={H - pct * (H - 10)}
            stroke="rgba(255,255,255,.04)"
            strokeWidth={1}
          />
        ))}

        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Peak marker */}
        <circle cx={peakX} cy={peakY} r={4} fill="var(--red)" />
        <text
          x={peakX}
          y={peakY - 8}
          textAnchor="middle"
          fontSize={9}
          fill="var(--red)"
          fontFamily="var(--font-mono)"
        >
          {data[peakIdx].count}
        </text>

        {/* X-axis labels */}
        {labels.map(l => (
          <text
            key={l.x}
            x={l.x}
            y={H + 14}
            fontSize={9}
            fill="var(--text3)"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </Card>
  );
}

export { SparklineChart };