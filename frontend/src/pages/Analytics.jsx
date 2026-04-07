// ============================================================
// FILE: frontend/src/pages/Analytics.jsx
// Charts & analytics page — top hosts, users, outcomes,
// event types, category breakdown for the selected time window.
// ============================================================

import Card from '../components/common/Card.jsx';
import { CardTitle } from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorMsg from '../components/common/ErrorMsg.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { SparklineChart } from '../components/SparklineChart.jsx';
import { CategoryDonut, TopEventsBar } from '../components/CategoryDonut.jsx';
import { useTopHosts, useTopUsers, useOutcomes } from '../hooks/useLogs';

const OUTCOME_COLOR = {
  success: 'var(--green)', allow: 'var(--green)', allowed: 'var(--green)',
  failure: 'var(--red)',   failed: 'var(--red)',
  blocked: 'var(--orange)', denied: 'var(--orange)', error: 'var(--red)',
};

function BarList({ items, valueKey, labelKey, color = 'var(--orange)', loading, error }) {
  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg msg={error} />;
  if (!items?.length) return <EmptyState />;
  const max = items[0]?.[valueKey] || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {items.slice(0, 10).map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 110, fontSize: 10, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {r[labelKey] || '—'}
          </span>
          <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
            <div style={{ width: `${Math.round(r[valueKey] / max * 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
          </div>
          <span style={{ width: 30, textAlign: 'right', fontSize: 10, color: 'var(--text)', fontWeight: 500 }}>{r[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

function Analytics({ hours }) {
  const hosts    = useTopHosts(hours);
  const users    = useTopUsers(hours);
  const outcomes = useOutcomes(hours);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SparklineChart hours={hours} />
        <CategoryDonut  hours={hours} />
      </div>

      {/* Breakdown row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

        <Card>
          <CardTitle>Top hosts</CardTitle>
          <BarList
            items={hosts.data}
            loading={hosts.loading}
            error={hosts.error}
            labelKey="host"
            valueKey="count"
            color="var(--orange)"
          />
        </Card>

        <Card>
          <CardTitle>Top users</CardTitle>
          <BarList
            items={users.data}
            loading={users.loading}
            error={users.error}
            labelKey="user"
            valueKey="count"
            color="var(--blue)"
          />
        </Card>

        <Card>
          <CardTitle>Outcome distribution</CardTitle>
          {outcomes.loading ? <Spinner /> : outcomes.error ? <ErrorMsg msg={outcomes.error} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(outcomes.data || []).map((r, i) => (
                <div
                  key={i}
                  style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    padding:        '6px 0',
                    borderBottom:   '1px solid var(--border)',
                    fontSize:       11,
                  }}
                >
                  <span style={{ color: OUTCOME_COLOR[r.outcome?.toLowerCase()] || 'var(--text2)' }}>
                    {r.outcome || 'unknown'}
                  </span>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <TopEventsBar hours={hours} />
    </div>
  );
}

export default Analytics;
