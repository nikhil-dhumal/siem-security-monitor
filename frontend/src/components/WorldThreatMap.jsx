// ============================================================
// FILE: frontend/src/components/WorldThreatMap.jsx
// D3 world map — plots real attacker IPs from the database.
// Data flow:
//   1. GET /api/logs/geo/  → raw { src_ip, count, category }
//   2. ip-api.com batch    → enriches with lat, lon, country
//   3. D3 + TopoJSON       → renders world map + dots
// Hover any dot for a tooltip (IP, city, ISP, events).
// Click a dot to drill into that IP in the log explorer.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Card, { CardTitle } from './common/Card.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMsg from './common/ErrorMsg.jsx';
import EmptyState from './common/EmptyState.jsx';
import { useGeoIPs } from '../hooks/useLogs';

// Color by event volume (relative to the session max)
function getDotColor(count, max) {
  const ratio = count / max;
  if (ratio > 0.5)  return '#ff3d57'; // critical volume
  if (ratio > 0.2)  return '#ff6b35'; // high
  if (ratio > 0.05) return '#ffc107'; // medium
  return '#2979ff';                    // low
}

// Dot radius scaled by volume (3–10 px)
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
  const { data, loading, error } = useGeoIPs(hours);

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

    const W    = 640;
    const H    = 310;
    const svg  = d3.select(svgRef.current).attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%');
    const proj = d3.geoNaturalEarth1().scale(103).translate([W / 2, H / 2]);
    const path = d3.geoPath(proj);
    const max  = Math.max(...data.map(d => d.count), 1);

    // Ocean background
    svg.append('rect')
      .attr('width', W).attr('height', H)
      .attr('fill', '#0a1520').attr('rx', 6);

    // World countries
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
      svg.selectAll('path.land')
        .data(topo.feature(world, world.objects.countries).features)
        .join('path')
        .attr('class', 'land')
        .attr('d', path)
        .attr('fill', '#152335')
        .attr('stroke', 'rgba(255,255,255,.05)')
        .attr('stroke-width', 0.4);

      // Plot each IP as a circle
      data.forEach(a => {
        const [px, py] = proj([a.lon, a.lat]);
        if (!px || !py) return;

        const color  = getDotColor(a.count, max);
        const radius = getDotRadius(a.count, max);

        // Pulse ring for high-volume IPs
        if (a.count > max * 0.3) {
          svg.append('circle')
            .attr('cx', px).attr('cy', py).attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.45)
            .style('animation', 'ripple 2s ease-out infinite');
        }

        // Main dot
        svg.append('circle')
          .attr('cx', px).attr('cy', py).attr('r', radius)
          .attr('fill', color)
          .attr('fill-opacity', 0.88)
          .attr('stroke', '#080b10')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseenter', () => {
            const br = wrapRef.current.getBoundingClientRect();
            const sr = svgRef.current.getBoundingClientRect();
            const sx = sr.width  / W;
            const sy = sr.height / H;
            let tx = px * sx + (sr.left - br.left) + 14;
            let ty = py * sy + (sr.top  - br.top)  - 12;
            if (tx + 175 > br.width) tx -= 188;
            if (ty < 4) ty = 4;
            setTip({ ...a, x: tx, y: ty });
          })
          .on('mouseleave', () => setTip(null))
          .on('click', () => onIPClick?.(a.src_ip));
      });

      // Inject ripple keyframe
      if (!document.getElementById('map-ripple-style')) {
        const s = document.createElement('style');
        s.id = 'map-ripple-style';
        s.textContent = '@keyframes ripple{0%{opacity:.6;r:8}100%{opacity:0;r:24}}';
        document.head.appendChild(s);
      }
    });
  }, [mapReady, data, onIPClick]);

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

      <div
        ref={wrapRef}
        style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden' }}
      >
        <svg ref={svgRef} style={{ display: 'block' }} />

        {/* Tooltip */}
        {tip && (
          <div
            style={{
              position:     'absolute',
              left:         tip.x,
              top:          tip.y,
              background:   'var(--bg2)',
              border:       '1px solid var(--border2)',
              borderRadius: 'var(--radius)',
              padding:      '8px 12px',
              fontSize:     11,
              pointerEvents:'none',
              zIndex:       10,
              minWidth:     168,
              animation:    'fadeIn .1s ease',
            }}
          >
            <div
              style={{
                fontWeight:   500,
                fontSize:     12,
                color:        'var(--text)',
                marginBottom: 4,
                fontFamily:   'var(--font-mono)',
              }}
            >
              {tip.src_ip}
            </div>
            {[
              ['Country',  tip.country    ],
              ['City',     tip.city       ],
              ['Region',   tip.regionName ],
              ['ISP',      tip.isp        ],
              ['Events',   tip.count      ],
              ['Category', tip.category   ],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  gap:            14,
                  marginTop:      2,
                }}
              >
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={{ color: 'var(--text2)' }}>{v ?? '—'}</span>
              </div>
            ))}
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
    </Card>
  );
}