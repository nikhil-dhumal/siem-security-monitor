import { useState, useEffect } from 'react';
import Card, { CardTitle } from './common/Card.jsx';
import Spinner from './common/Spinner.jsx';
import ErrorMsg from './common/ErrorMsg.jsx';

const SEVERITY_COLOR = {
  HIGH: '#ff3d57',
  MEDIUM: '#ff6b35',
  LOW: '#ffc107',
};

const SEVERITY_BG = {
  HIGH: 'rgba(255, 61, 87, 0.1)',
  MEDIUM: 'rgba(255, 107, 53, 0.1)',
  LOW: 'rgba(255, 193, 7, 0.1)',
};

export default function SecurityAlerts({ hours = 24 }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    
    const fetchAlerts = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        const response = await fetch(`http://localhost:8888/api/logs/?hours=${hours}&limit=1000`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (isMounted) {
          if (data.results && Array.isArray(data.results)) {
            setAlerts(data.results);
          } else if (Array.isArray(data)) {
            setAlerts(data);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('SecurityAlerts fetch error:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();
    // Reduced frequency from 5000ms to 30000ms to prevent excessive reloads
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hours]);

  // Extract security threats from logs
  const threats = (alerts || []).map(log => {
    let severity = 'LOW';
    let threatType = 'Other';
    
    // Brute force detection
    if (log.category === 'auth' && (log.outcome === 'failure' || log.outcome === 'failed')) {
      severity = 'HIGH';
      threatType = 'Brute Force Attempt';
    }
    // Root command execution
    else if (log.category === 'process' && (log.command?.includes('passwd') || log.command?.includes('shadow'))) {
      severity = 'HIGH';
      threatType = 'Suspicious Root Command';
    }
    // Malicious DNS
    else if (log.category === 'network' && log.domain && (log.domain.includes('malicious') || log.domain.includes('malware'))) {
      severity = 'MEDIUM';
      threatType = 'Malicious DNS Query';
    }
    // Port scan
    else if (log.category === 'network' && (log.event_type?.includes('port') || log.event_type?.includes('scan'))) {
      severity = 'MEDIUM';
      threatType = 'Port Scan Detected';
    }
    // File suspicious activity
    else if (log.category === 'file') {
      severity = 'MEDIUM';
      threatType = 'File Activity';
    }
    // Access denied
    else if (log.outcome === 'denied' || log.outcome === 'blocked' || log.outcome === 'failure') {
      severity = 'LOW';
      threatType = 'Access Denied';
    }

    return {
      ...log,
      severity,
      threatType,
    };
  }).filter(t => t.severity !== 'LOW' || t.threatType !== 'Other');

  const filtered = filter === 'all' 
    ? threats 
    : threats.filter(t => t.severity === filter);

  const severityCounts = {
    HIGH: threats.filter(t => t.severity === 'HIGH').length,
    MEDIUM: threats.filter(t => t.severity === 'MEDIUM').length,
    LOW: threats.filter(t => t.severity === 'LOW').length,
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg error={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Severity Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {['HIGH', 'MEDIUM', 'LOW'].map(severity => (
          <Card key={severity}>
            <div style={{ padding: '8px 0' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: SEVERITY_COLOR[severity],
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {severity} Severity
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)' }}>
                {severityCounts[severity]}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['all', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius)',
              border: `1px solid ${filter === sev ? SEVERITY_COLOR[sev] || 'var(--accent)' : 'var(--border)'}`,
              background: filter === sev ? (SEVERITY_BG[sev] || 'rgba(0, 229, 255, 0.1)') : 'transparent',
              color: filter === sev ? (SEVERITY_COLOR[sev] || 'var(--accent)') : 'var(--text3)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {sev === 'all' ? 'All Threats' : sev}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <Card>
        <CardTitle>Security Events ({filtered.length})</CardTitle>
        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
              No security events
            </div>
          ) : (
            filtered.map((threat, idx) => (
              <div
                key={threat.id || idx}
                style={{
                  padding: '10px 12px',
                  marginBottom: '8px',
                  borderRadius: 'var(--radius)',
                  background: SEVERITY_BG[threat.severity],
                  border: `1px solid ${SEVERITY_COLOR[threat.severity]}44`,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: SEVERITY_COLOR[threat.severity],
                    marginTop: '4px',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text)',
                      marginBottom: 2,
                    }}
                  >
                    {threat.threatType}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text3)',
                      marginBottom: 4,
                    }}
                  >
                    {threat.raw_log}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)' }}>
                    {threat.src_ip && <span>IP: {threat.src_ip}</span>}
                    {threat.host && <span>Host: {threat.host}</span>}
                    {threat.user && <span>User: {threat.user}</span>}
                    {threat.timestamp && (
                      <span>
                        {new Date(threat.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
