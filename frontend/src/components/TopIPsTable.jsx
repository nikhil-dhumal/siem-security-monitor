import Card, { CardTitle } from './common/Card.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMsg from './common/ErrorMsg.jsx';
import EmptyState from './common/EmptyState.jsx';
import { useTopIPs } from '../hooks/useLogs';
import Pill from './common/Pill.jsx';

export function TopIPsTable({ hours, onIPClick }) {
  const { data, loading, error } = useTopIPs(hours);

  if (loading) return <Card style={{ height: 220 }}><Spinner /></Card>;
  if (error)   return <Card><ErrorMsg msg={error} /></Card>;
  if (!data?.length) return <Card><EmptyState message="No IP data" /></Card>;

  const max = data[0]?.count || 1;

  return (
    <Card>
      <CardTitle>Top source IPs</CardTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {data.slice(0, 12).map((r, i) => (
          <div
            key={r.src_ip}
            onClick={() => onIPClick?.(r.src_ip)}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         8,
              padding:     '5px 0',
              borderBottom:'1px solid var(--border)',
              cursor:      onIPClick ? 'pointer' : 'default',
              transition:  'background .1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ width: 16, fontSize: 9, color: 'var(--text3)' }}>{i + 1}</span>
            <span
              style={{
                flex:       1,
                fontFamily: 'var(--font-mono)',
                fontSize:   10,
                color:      'var(--accent2)',
              }}
            >
              {r.src_ip}
            </span>
            <div
              style={{
                width:        56,
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
                }}
              />
            </div>
            <span
              style={{
                width:      28,
                textAlign:  'right',
                fontSize:   10,
                fontWeight: 500,
                color:      'var(--text)',
                flexShrink: 0,
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


import { useState, useEffect } from 'react';
import { Pill, SEV_COLORS } from './ui/index.jsx';
import { useLogTable } from '../hooks/useLogs';

const OUTCOME_COLOR = {
  success: 'var(--green)',
  allow:   'var(--green)',
  allowed: 'var(--green)',
  failure: 'var(--red)',
  failed:  'var(--red)',
  blocked: 'var(--orange)',
  denied:  'var(--orange)',
  error:   'var(--red)',
};

const TD = {
  padding:      '5px 8px',
  borderBottom: '1px solid var(--border)',
  color:        'var(--text2)',
  verticalAlign:'middle',
  fontSize:     11,
  overflow:     'hidden',
  textOverflow: 'ellipsis',
  whiteSpace:   'nowrap',
};

const COL_WIDTHS = [130, 90, 80, 120, 72, 80, 110, 110, 55];
const HEADERS    = ['Timestamp','Host','Category','Event type','Outcome','User','Src IP','Dst IP','Proto'];

function FilterInput({ placeholder, value, onChange, width = 110 }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background:   'var(--bg4)',
        border:       '1px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding:      '4px 10px',
        fontSize:     11,
        color:        'var(--text)',
        width,
      }}
    />
  );
}

export function LogTable({ hours, initialSrcIP = '' }) {
  const [filters, setFilters] = useState({
    hours,
    category:   '',
    event_type: '',
    outcome:    '',
    src_ip:     initialSrcIP,
    host:       '',
    search:     '',
    page:       1,
    page_size:  50,
  });

  // Update hours when parent changes it
  useEffect(() => {
    setFilters(f => ({ ...f, hours, page: 1 }));
  }, [hours]);

  // Pre-fill src_ip filter if coming from map click
  useEffect(() => {
    if (initialSrcIP) setFilters(f => ({ ...f, src_ip: initialSrcIP, page: 1 }));
  }, [initialSrcIP]);

  const { data, loading, error } = useLogTable(filters);

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          display:    'flex',
          gap:        8,
          marginBottom: 10,
          flexWrap:   'wrap',
          alignItems: 'center',
        }}
      >
        <FilterInput
          placeholder="Search raw log…"
          value={filters.search}
          onChange={v => setF('search', v)}
          width={220}
        />
        <FilterInput placeholder="category"   value={filters.category}   onChange={v => setF('category', v)} />
        <FilterInput placeholder="event_type" value={filters.event_type} onChange={v => setF('event_type', v)} />
        <FilterInput placeholder="outcome"    value={filters.outcome}    onChange={v => setF('outcome', v)} />
        <FilterInput placeholder="src_ip"     value={filters.src_ip}     onChange={v => setF('src_ip', v)} />
        <FilterInput placeholder="host"       value={filters.host}       onChange={v => setF('host', v)} />

        {/* Clear filters */}
        {Object.values(filters).some(v => typeof v === 'string' && v) && (
          <button
            onClick={() => setFilters(f => ({ ...f, category:'', event_type:'', outcome:'', src_ip:'', host:'', search:'', page:1 }))}
            style={{
              fontSize:     10,
              padding:      '4px 10px',
              borderRadius: 'var(--radius)',
              border:       '1px solid var(--border2)',
              color:        'var(--text3)',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && <ErrorMsg msg={error} />}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {HEADERS.map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding:      '5px 8px',
                    textAlign:    'left',
                    fontSize:     10,
                    color:        'var(--text3)',
                    fontWeight:   400,
                    borderBottom: '1px solid var(--border)',
                    width:        COL_WIDTHS[i],
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={HEADERS.length} style={{ padding: 20, textAlign: 'center' }}>
                  <Spinner />
                </td>
              </tr>
            ) : (data?.results || []).length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>
                  No logs match your filters
                </td>
              </tr>
            ) : (
              (data?.results || []).map((r, i) => (
                <tr
                  key={r.id}
                  style={{ cursor: 'pointer', transition: 'background .08s', animation: `fadeUp .2s ease ${i * 0.02}s both` }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...TD, fontSize: 10, color: 'var(--text3)' }}>
                    {r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}
                  </td>
                  <td style={TD}>{r.host || '—'}</td>
                  <td style={TD}><Pill text={r.category || '—'} /></td>
                  <td style={{ ...TD, color: 'var(--text)' }}>{r.event_type || '—'}</td>
                  <td style={{ ...TD, color: OUTCOME_COLOR[r.outcome?.toLowerCase()] || 'var(--text2)' }}>
                    {r.outcome || '—'}
                  </td>
                  <td style={TD}>{r.user || '—'}</td>
                  <td style={{ ...TD, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)' }}>
                    {r.src_ip || '—'}
                  </td>
                  <td style={{ ...TD, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                    {r.dst_ip || '—'}
                  </td>
                  <td style={TD}>{r.proto || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && (
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginTop:      10,
            fontSize:       11,
            color:          'var(--text3)',
          }}
        >
          <span>{(data?.count ?? 0).toLocaleString()} total results</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              disabled={!data?.previous}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              style={{
                fontSize:     11,
                padding:      '3px 12px',
                borderRadius: 'var(--radius)',
                border:       '1px solid var(--border2)',
                color:        'var(--text2)',
                opacity:      data?.previous ? 1 : 0.3,
                cursor:       data?.previous ? 'pointer' : 'not-allowed',
              }}
            >
              ← Prev
            </button>
            <span style={{ padding: '0 6px' }}>Page {filters.page}</span>
            <button
              disabled={!data?.next}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              style={{
                fontSize:     11,
                padding:      '3px 12px',
                borderRadius: 'var(--radius)',
                border:       '1px solid var(--border2)',
                color:        'var(--text2)',
                opacity:      data?.next ? 1 : 0.3,
                cursor:       data?.next ? 'pointer' : 'not-allowed',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}