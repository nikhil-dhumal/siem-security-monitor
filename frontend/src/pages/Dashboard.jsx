import { useState } from 'react';
import MetricCards    from '../components/MetricCards.jsx';
import SparklineChart from '../components/SparklineChart.jsx';
import { CategoryDonut, TopEventsBar } from '../components/CategoryDonut.jsx';
import WorldThreatMap from '../components/WorldThreatMap.jsx';
import { TopIPsTable, LogTable } from '../components/LogTable.jsx';
import LiveAlertFeed  from '../components/LiveAlertFeed.jsx';
import SecurityAlerts from '../components/SecurityAlerts.jsx';
import Card           from '../components/common/Card.jsx';
import { CardTitle }  from '../components/common/Card.jsx';

export default function Dashboard({ hours }) {
  const [drillIP, setDrillIP] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      <MetricCards hours={hours} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px 230px', gap: 12 }}>
        <SparklineChart hours={hours} />
        <CategoryDonut  hours={hours} />
        <TopEventsBar   hours={hours} />
      </div>

      {/* Security Alerts Dashboard */}
      <SecurityAlerts hours={hours} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
        <WorldThreatMap hours={hours} onIPClick={ip => setDrillIP(ip)} />

        <LiveAlertFeed maxLogs={25} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
        <TopIPsTable hours={hours} onIPClick={ip => setDrillIP(ip)} />

        <Card>
          <CardTitle right={drillIP ? `Filtered: ${drillIP}` : undefined}>
            Log explorer
          </CardTitle>
          <LogTable hours={hours} initialSrcIP={drillIP} />
        </Card>
      </div>

    </div>
  );
}

export { Dashboard };