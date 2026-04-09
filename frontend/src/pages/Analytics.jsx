import { useEffect, useState } from 'react';
import logsApi from '../api/logsApi';

const OUTCOME_COLOR = {
  success: '#10b981',
  allow: '#10b981',
  allowed: '#10b981',
  failure: '#ef4444',
  failed: '#ef4444',
  blocked: '#f97316',
  denied: '#f97316',
};

const OutcomeDistribution = ({ outcomes = [] }) => {
  const total = outcomes.reduce((sum, item) => sum + item.count, 0) || 1;
  const outcomeList = [
    { label: 'Success', key: 'success', color: '#10b981' },
    { label: 'Allowed', key: 'allowed', color: '#10b981' },
    { label: 'Failure', key: 'failure', color: '#ef4444' },
    { label: 'Blocked', key: 'blocked', color: '#f97316' },
    { label: 'Unknown', key: 'unknown', color: '#9ca3af' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <h2 className="mb-6 text-lg font-bold text-gray-900">Event Outcomes</h2>
      <div className="space-y-4">
        {outcomeList.map((item) => {
          const count = outcomes.find((o) => (o.outcome || 'unknown').toLowerCase() === item.key)?.count || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{count} ({percentage}%)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Total Events: <span className="font-bold text-gray-900">{total}</span>
        </p>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [hours, setHours] = useState(24);
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [topHosts, setTopHosts] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      const params = { hours };

      const [summaryRes, timelineRes, categoriesRes, eventTypesRes, topIpsRes, topHostsRes, outcomesRes] = await Promise.all([
        logsApi.fetchSummary(params),
        logsApi.fetchTimeline(params),
        logsApi.fetchCategories(params),
        logsApi.fetchEventTypes(params),
        logsApi.fetchTopIps(params),
        logsApi.fetchTopHosts(params),
        logsApi.fetchOutcomes(params),
      ]);

      if (summaryRes.response) setSummary(summaryRes.response);
      if (timelineRes.response) setTimeline(timelineRes.response);
      if (categoriesRes.response) setCategories(categoriesRes.response);
      if (eventTypesRes.response) setEventTypes(eventTypesRes.response);
      if (topIpsRes.response) setTopIps(topIpsRes.response);
      if (topHostsRes.response) setTopHosts(topHostsRes.response);
      if (outcomesRes.response) setOutcomes(outcomesRes.response);

      setLoading(false);
    };

    loadAnalytics();
  }, [hours]);

  const MetricCard = ({ title, value, subtitle }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      <p className="text-xs uppercase tracking-wider font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value || 0}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  const BarChart = ({ title, data, labelKey, valueKey, maxHeight = 200 }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map((d) => d[valueKey]));

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2" style={{ height: `${maxHeight}px` }}>
          {data.slice(0, 10).map((item, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div
                style={{
                  height: `${(item[valueKey] / max) * (maxHeight - 30)}px`,
                  background: '#3b82f6',
                  borderRadius: '4px',
                  width: '100%',
                  minHeight: '4px',
                }}
              />
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-600">
                {item[labelKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SimpleTable = ({ title, data, columns }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>
      <div className="space-y-1">
        {data?.length ? (
          data.slice(0, 10).map((item, i) => (
            <div key={i} className="flex justify-between border-b border-gray-100 px-4 py-2 text-sm last:border-0">
              {columns.map((col, j) => (
                <span key={j} className={j === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}>
                  {item[col.key]}
                </span>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );

  const successCount = summary?.success_count || 0;
  const failureCount = summary?.failure_count || 0;
  const totalEvents = summary?.total_events || 0;
  const knownOutcomes = successCount + failureCount;
  const unknownCount = totalEvents - knownOutcomes;
  const knownFailureRate = ((failureCount / (knownOutcomes || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">Time range:</span>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={7 * 24}>Last 7 days</option>
            <option value={30 * 24}>Last 30 days</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Events" value={summary?.total_events} />
        <MetricCard title="Unique Source IPs" value={summary?.unique_src_ips} />
        <MetricCard title="Unique Hosts" value={summary?.unique_hosts} />
        <MetricCard 
          title="Known Failure Rate"
          value={`${knownFailureRate}%`}
          subtitle={`${failureCount} known failures out of ${knownOutcomes} known events`}
        />
      </div>
      {unknownCount > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          {unknownCount} events ({((unknownCount / (totalEvents || 1)) * 100).toFixed(1)}%) have no mapped outcome yet.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="Events by Category" data={categories} labelKey="category" valueKey="count" />
        <BarChart title="Events by Type" data={eventTypes} labelKey="event_type" valueKey="count" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleTable title="Top 10 Source IPs" data={topIps} columns={[{ key: 'src_ip' }, { key: 'count' }]} />
        <SimpleTable title="Top 10 Hosts" data={topHosts} columns={[{ key: 'host' }, { key: 'count' }]} />
      </div>

      <OutcomeDistribution outcomes={outcomes} />
    </div>
  );
};

export default Analytics;
