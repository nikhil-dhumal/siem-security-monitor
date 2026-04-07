// ============================================================
// FILE: frontend/src/App.jsx
// Root application shell.
// Renders: Sidebar + TopBar + routed page content.
// All pages receive `hours` prop (time window selector).
// ============================================================

import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import LogExplorer from './pages/LogExplorer.jsx';
import ThreatMap from './pages/ThreatMap.jsx';
import Analytics from './pages/Analytics.jsx';
import SettingsPage from './pages/Settings.jsx';

function App() {
  const [hours, setHours] = useState(24);
  const [active, setActive] = useState('dashboard');

  return (
    <HashRouter>
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
        <Sidebar active={active} onNav={id => {
          setActive(id);
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar hours={hours} onHoursChange={setHours} />
          <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            <Routes>
              <Route path="/" element={<Dashboard hours={hours} />} />
              <Route path="/logs" element={<LogExplorer hours={hours} />} />
              <Route path="/threats" element={<ThreatMap hours={hours} />} />
              <Route path="/analytics" element={<Analytics hours={hours} />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;