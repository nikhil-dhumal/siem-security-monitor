import Card, { CardTitle } from '../components/common/Card.jsx';
import MetricCards from '../components/MetricCards.jsx';
import { LogTable } from '../components/LogTable.jsx';

export function LogExplorerPage({ hours }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MetricCards hours={hours} />
      <Card>
        <CardTitle>Log search</CardTitle>
        <LogTable hours={hours} />
      </Card>
    </div>
  );
}

export default LogExplorerPage;
