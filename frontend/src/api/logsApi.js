const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888';
const API  = `${BASE}/api/logs`;

async function apiFetch(url) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  return res.json();
}

function qs(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '' && v !== false) {
      q.set(k, v);
    }
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function fetchSummary({ hours = 24 } = {}) {
  return apiFetch(`${API}/summary/${qs({ hours })}`);
}

export function fetchLogs({
  hours      = 24,
  category   = null,
  event_type = null,
  outcome    = null,
  src_ip     = null,
  host       = null,
  search     = null,
  page       = 1,
  page_size  = 50,
} = {}) {
  return apiFetch(
    `${API}/${qs({ hours, category, event_type, outcome, src_ip, host, search, page, page_size })}`
  );
}

export function fetchLogDetail(id) {
  return apiFetch(`${API}/${id}/`);
}

export function fetchTimeline({ hours = 24, bucket = 'hour' } = {}) {
  return apiFetch(`${API}/timeline/${qs({ hours, bucket })}`);
}

export function fetchCategories({ hours = 24 } = {}) {
  return apiFetch(`${API}/categories/${qs({ hours })}`);
}

export function fetchEventTypes({ hours = 24 } = {}) {
  return apiFetch(`${API}/event-types/${qs({ hours })}`);
}

export function fetchOutcomes({ hours = 24 } = {}) {
  return apiFetch(`${API}/outcomes/${qs({ hours })}`);
}

export function fetchGeoIPs({ hours = 24 } = {}) {
  return apiFetch(`${API}/geo/${qs({ hours })}`);
}

export function fetchTopIPs({ hours = 24, limit = 20 } = {}) {
  return apiFetch(`${API}/top-ips/${qs({ hours, limit })}`);
}

export function fetchTopHosts({ hours = 24, limit = 10 } = {}) {
  return apiFetch(`${API}/top-hosts/${qs({ hours, limit })}`);
}

export function fetchTopUsers({ hours = 24, limit = 10 } = {}) {
  return apiFetch(`${API}/top-users/${qs({ hours, limit })}`);
}

export async function resolveGeoIPs(ips = []) {
  if (!ips.length) return [];
  const body = ips.slice(0, 100).map(ip => ({
    query: ip,
    fields: 'query,country,countryCode,regionName,city,isp,lat,lon,status',
  }));
  try {
    const res = await fetch('http://ip-api.com/batch', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}