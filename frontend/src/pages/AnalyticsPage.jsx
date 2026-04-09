import TopBar from '../components/layout/TopBar';
import Analytics from '../pages/Analytics';

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <TopBar title="Security Analytics" />
      <div className="px-6 pb-6">
        <Analytics />
      </div>
    </div>
  );
};

export default AnalyticsPage;
