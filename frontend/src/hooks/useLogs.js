// ============================================================
// FILE: frontend/src/hooks/useLogs.js
// Custom React hooks — wraps every API call with
// loading / error / data state + 30s auto-refresh.
// All dashboard components import from here.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSummary,
  fetchLogs,
  fetchLogDetail,
  fetchTimeline,
  fetchCategories,
  fetchEventTypes,
  fetchOutcomes,
  fetchGeoIPs,
  fetchTopIPs,
  fetchTopHosts,
  fetchTopUsers,
  resolveGeoIPs,
} from '../api/logsApi';

const REFRESH_MS = 30_000; // 30-second polling interval

// ── Generic hook ─────────────────────────────────────────────
function useData(fetcher, deps = [], autoRefresh = true) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    if (autoRefresh) {
      timerRef.current = setInterval(load, REFRESH_MS);
    }
    return () => clearInterval(timerRef.current);
  }, [load, autoRefresh]);

  return { data, loading, error, reload: load };
}

// ============================================================
// useSummary — powers MetricCards (KPI row)
// Returns: { total_events, unique_src_ips, unique_hosts,
//            failure_count, success_count, latest_event }
// ============================================================
export function useSummary(hours = 24) {
  return useData(() => fetchSummary({ hours }), [hours]);
}

// ============================================================
// useTimeline — powers SparklineChart
// Returns: [{ bucket, count }, …]
// ============================================================
export function useTimeline(hours = 24, bucket = 'hour') {
  return useData(() => fetchTimeline({ hours, bucket }), [hours, bucket]);
}

// ============================================================
// useCategories — powers CategoryDonut
// Returns: [{ category, count }, …]
// ============================================================
export function useCategories(hours = 24) {
  return useData(() => fetchCategories({ hours }), [hours]);
}

// ============================================================
// useEventTypes — powers TopEventsBar
// Returns: [{ event_type, count }, …]
// ============================================================
export function useEventTypes(hours = 24) {
  return useData(() => fetchEventTypes({ hours }), [hours]);
}

// ============================================================
// useOutcomes — powers OutcomeChart on Analytics page
// Returns: [{ outcome, count }, …]
// ============================================================
export function useOutcomes(hours = 24) {
  return useData(() => fetchOutcomes({ hours }), [hours]);
}

// ============================================================
// useGeoIPs — powers WorldThreatMap
// Fetches IPs from Django → resolves lat/lon via ip-api.com
// Returns: [{ src_ip, count, lat, lon, country, city, isp }, …]
// ============================================================
export function useGeoIPs(hours = 24) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw    = await fetchGeoIPs({ hours });
      const ips    = raw.map(r => r.src_ip);
      const geo    = await resolveGeoIPs(ips);
      const geoMap = Object.fromEntries(geo.map(g => [g.query, g]));
      const enriched = raw
        .map(r => ({ ...r, ...(geoMap[r.src_ip] || {}) }))
        .filter(r => r.lat && r.lon);
      setData(enriched);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  return { data, loading, error, reload: load };
}

// ============================================================
// useTopIPs — powers TopIPsTable
// Returns: [{ src_ip, count }, …]
// ============================================================
export function useTopIPs(hours = 24, limit = 20) {
  return useData(() => fetchTopIPs({ hours, limit }), [hours, limit]);
}

// ============================================================
// useTopHosts — powers TopHostsBar on Analytics page
// Returns: [{ host, count }, …]
// ============================================================
export function useTopHosts(hours = 24) {
  return useData(() => fetchTopHosts({ hours }), [hours]);
}

// ============================================================
// useTopUsers — powers TopUsersTable on Analytics page
// Returns: [{ user, count }, …]
// ============================================================
export function useTopUsers(hours = 24) {
  return useData(() => fetchTopUsers({ hours }), [hours]);
}

// ============================================================
// useLogTable — powers LogTable and LogExplorer page
// Accepts all filter params; no auto-refresh (user-controlled)
// Returns paginated: { count, next, previous, results[] }
// ============================================================
export function useLogTable(filters = {}) {
  const {
    hours      = 24,
    category   = null,
    event_type = null,
    outcome    = null,
    src_ip     = null,
    host       = null,
    search     = null,
    page       = 1,
    page_size  = 50,
  } = filters;

  return useData(
    () => fetchLogs({ hours, category, event_type, outcome, src_ip, host, search, page, page_size }),
    [hours, category, event_type, outcome, src_ip, host, search, page, page_size],
    false
  );
}

// ============================================================
// useLogDetail — powers LogDetailDrawer
// Returns full Log object including raw + raw_log
// ============================================================
export function useLogDetail(id) {
  return useData(
    () => (id ? fetchLogDetail(id) : Promise.resolve(null)),
    [id],
    false
  );
}