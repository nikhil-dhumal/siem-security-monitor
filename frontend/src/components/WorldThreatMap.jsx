import { useEffect, useRef, useState } from 'react';
import Card, { CardTitle } from './common/Card.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMsg from './common/ErrorMsg.jsx';
import EmptyState from './common/EmptyState.jsx';
import { useGeoIPs } from '../hooks/useLogs';

function getDotColor(count, max) {
  const ratio = count / max;
  if (ratio > 0.5)  return '#ff3d57';
  if (ratio > 0.2)  return '#ff6b35';
  if (ratio > 0.05) return '#ffc107';
  return '#2979ff';
}

function getDotRadius(count, max) {
  return Math.max(3, Math.min(10, 3 + (count / max) * 8));
}

const LEGEND = [
  { color: '#ff3d57', label: 'High volume'  },
  { color: '#ff6b35', label: 'Medium'       },
  { color: '#ffc107', label: 'Low'          },
  { color: '#2979ff', label: 'Minimal'      },
];

export default function WorldThreatMap({ hours, onIPClick }) {
  // DEBUG: Show what IPs are being geo-located and what geo data is returned
  const { data, loading, error } = useGeoIPs(hours);

  useEffect(() => {
    if (data) {
      console.log('[WorldThreatMap] GeoIP data:', data);
      if (data.length === 0) {
        console.warn('[WorldThreatMap] No geo-located IPs found. Your logs may only contain private IPs (e.g., 10.x.x.x, 192.168.x.x, 127.0.0.1) or the backend is not generating public IPs.');
      }
    }
  }, [data]);

  const svgRef   = useRef(null);
  const wrapRef  = useRef(null);
  const drawnRef = useRef(false);

  const [tip,      setTip]      = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Load D3 + TopoJSON from CDN once
  useEffect(() => {
    if (window.d3 && window.topojson) { setMapReady(true); return; }
    const d3Script = document.createElement('script');
    d3Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
    d3Script.onload = () => {
      const topoScript = document.createElement('script');
      topoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
      topoScript.onload = () => setMapReady(true);
      document.head.appendChild(topoScript);
    };
    document.head.appendChild(d3Script);
  }, []);

  // Draw map once both map libs and data are ready
  useEffect(() => {
    if (!mapReady || !data?.length || !svgRef.current || drawnRef.current) return;

    const d3     = window.d3;
    const topo   = window.topojson;
    if (!d3 || !topo) return;

    drawnRef.current = true;

    const W    = 800;
    const H    = 450;
    const svg  = d3.select(svgRef.current).attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');
    const proj = d3.geoNaturalEarth1().scale(160).translate([W / 2, H / 2]);
    const path = d3.geoPath(proj);
    const max  = Math.max(...data.map(d => d.count || 0), 1);
    
    // Single group for all zoomable content
    const g = svg.append('g');
    
    // Enable zoom functionality
    const zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    svg.call(zoom);

    // Ocean background
    g.append('rect')
      .attr('width', W).attr('height', H)
      .attr('fill', '#0a1520').attr('rx', 6);

    // World countries
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
      g.selectAll('path.land')
        .data(topo.feature(world, world.objects.countries).features)
        .join('path')
        .attr('class', 'land')
        .attr('d', path)
        .attr('fill', '#152335')
        .attr('stroke', 'rgba(255,255,255,.05)')
        .attr('stroke-width', 0.4);

      // Plot each IP as a circle (in zoomable group so they move with map)
      const validData = data.filter(a => a.lat && a.lon);
      validData.forEach(a => {
        const [px, py] = proj([a.lon, a.lat]);
        if (!px || !py) return;

        const r = getDotRadius(a.count, max);
        const c = getDotColor(a.count, max);

        g.append('circle')
          .attr('cx', px).attr('cy', py).attr('r', r)
          .attr('fill', c).attr('opacity', 0.8)
          .attr('stroke', 'rgba(255,255,255,.2)').attr('stroke-width', 0.5)
          .on('mouseenter', function() {
            d3.select(this).attr('opacity', 1).attr('r', r + 2).attr('stroke-width', 1.5);
            setTip({ ...a, x: px + 15, y: py - 15 });
          })
          .on('mouseleave', function() {
            d3.select(this).attr('opacity', 0.8).attr('r', r).attr('stroke-width', 0.5);
            setTip(null);
          })
          .on('click', () => onIPClick?.(a.src_ip));
      });
    }).catch(err => console.error('Failed to load world map:', err));
  }, [mapReady, data]);

  return (
    <Card>
      <CardTitle right={loading ? 'resolving IPs…' : `${data?.length ?? 0} IPs mapped`}>
        World threat map — real-time attacker origins
      </CardTitle>

      {loading && <Spinner />}
      {error   && <ErrorMsg msg={error} />}
      {!loading && !error && !data?.length && (
        <EmptyState message="No geo data — IPs may not have resolved" />
      )}

      {data?.length > 0 && (
        <>
          <div
            ref={wrapRef}
            style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', minHeight: 480 }}
          >
            <svg ref={svgRef} style={{ display: 'block', width: '100%', height: 480 }} />

            {/* Tooltip */}
            {tip && (
              <div
                style={{
                  position:     'absolute',
                  left:         tip.x,
                  top:          tip.y,
                  background:   'var(--bg2)',
                  border:       '2px solid #ff3d57',
                  borderRadius: 'var(--radius)',
                  padding:      '12px 14px',
                  fontSize:     11,
                  pointerEvents:'none',
                  zIndex:       1000,
                  minWidth:     280,
                  maxWidth:     400,
                  boxShadow:    '0 8px 24px rgba(0,0,0,0.4)',
                  animation:    'fadeIn .1s ease',
                }}
              >
                {/* IP Header */}
                <div
                  style={{
                    fontWeight:   700,
                    fontSize:     13,
                    color:        '#ff3d57',
                    marginBottom: 8,
                    fontFamily:   'var(--font-mono)',
                    wordBreak:    'break-all',
                  }}
                >
                  🔴 {tip.src_ip}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,.1)', marginBottom: 8 }} />

                {/* Attack Details */}
                <div style={{ marginBottom: 8 }}>
                  {[
                    { label: '📍 Country', value: tip.country || '—' },
                    { label: '🏙️ City', value: tip.city || '—' },
                    { label: '🌍 Region', value: tip.regionName || '—' },
                    { label: '🏢 ISP', value: tip.isp || '—' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display:        'flex',
                        justifyContent: 'space-between',
                        gap:            12,
                        marginBottom:   4,
                        fontSize:       10,
                      }}
                    >
                      <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
                      <span style={{ color: 'var(--text2)', textAlign: 'right', maxWidth: '200px', wordBreak: 'break-word' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,.1)', marginBottom: 8 }} />

                {/* Event Stats */}
                <div style={{ marginBottom: 8 }}>
                  {[
                    { label: '⚠️ Events', value: tip.count ? `${tip.count} events` : '—', color: '#ffc107' },
                    { label: '🏷️ Category', value: tip.category || '—' },
                    { label: '🎯 Event Type', value: tip.event_type || '—' },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      style={{
                        display:        'flex',
                        justifyContent: 'space-between',
                        gap:            12,
                        marginBottom:   4,
                        fontSize:       10,
                      }}
                    >
                      <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
                      <span style={{ color: color || 'var(--text2)', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,.1)', marginBottom: 8 }} />

                {/* User & Outcome */}
                <div>
                  {[
                    { label: '👤 User', value: tip.user || 'N/A', isUser: true },
                    { label: '🎛️ Host', value: tip.host || 'N/A' },
                    { label: '📊 Outcome', value: tip.outcome ? tip.outcome.toUpperCase() : '—', color: tip.outcome === 'success' || tip.outcome === 'allow' ? '#4caf50' : tip.outcome === 'failure' || tip.outcome === 'failed' || tip.outcome === 'denied' || tip.outcome === 'blocked' ? '#ff3d57' : 'var(--text2)' },
                    { label: '🔌 Dst Port', value: tip.dst_port || 'N/A' },
                    { label: '🔌 Src Port', value: tip.src_port || 'N/A' },
                  ].map(({ label, value, color, isUser }) => (
                    value && value !== 'N/A' && value !== '—' ? (
                      <div
                        key={label}
                        style={{
                          display:        'flex',
                          justifyContent: 'space-between',
                          gap:            12,
                          marginBottom:   4,
                          fontSize:       10,
                        }}
                      >
                        <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
                        <span style={{ color: color || (isUser ? '#00e5ff' : 'var(--text2)'), fontWeight: isUser ? 600 : 500 }}>{value}</span>
                      </div>
                    ) : null
                  ))}
                </div>

                {/* Footer */}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255,255,255,.1)',
                    fontSize: 9,
                    color: 'var(--text3)',
                    fontStyle: 'italic',
                  }}
                >
                  💡 Click dot to investigate this IP
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div
            style={{
              display:    'flex',
              gap:        14,
              marginTop:  8,
              fontSize:   10,
              color:      'var(--text3)',
              flexWrap:   'wrap',
            }}
          >
            {LEGEND.map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width:        8,
                    height:       8,
                    borderRadius: '50%',
                    background:   l.color,
                    display:      'inline-block',
                  }}
                />
                {l.label}
              </span>
            ))}
            <span style={{ marginLeft: 'auto' }}>Click dot to investigate IP</span>
          </div>
        </>
      )}
    </Card>
  );
}
