import { useState } from 'react';
import WorldThreatMap from '../components/WorldThreatMap.jsx';
import { TopIPsTable } from '../components/LogTable.jsx';

export function GeoMapPage({ hours }) {
  const [activeIP, setActiveIP] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <WorldThreatMap hours={hours} onIPClick={setActiveIP} />
      <TopIPsTable    hours={hours} onIPClick={setActiveIP} />
      {activeIP && (
        <div
          style={{
            padding:      '8px 14px',
            background:   'rgba(0,229,255,.06)',
            border:       '1px solid rgba(0,229,255,.2)',
            borderRadius: 'var(--radius)',
            fontSize:     11,
            color:        'var(--accent)',
          }}
        >
          Selected IP: <strong>{activeIP}</strong> — go to Log Explorer to search logs for this IP
        </div>
      )}
    </div>
  );
}
