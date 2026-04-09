import { useEffect, useState } from 'react';
import incidentsApi from '../api/incidentsApi';

const IncidentTable = () => {
  const [openIncidents, setOpenIncidents] = useState(0);
  const [highSeverityAlerts, setHighSeverityAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      const { response, err } = await incidentsApi.fetchIncidents({ page_size: 50 });
      if (err) {
        setOpenIncidents(0);
        setHighSeverityAlerts(0);
      } else {
        const incidents = response.results || response;
        setOpenIncidents(incidents.length);
        setHighSeverityAlerts(
          incidents.reduce((sum, item) => sum + (item.high_severity_alerts || 0), 0)
        );
      }
      setLoading(false);
    };

    loadIncidents();
  }, []);

  return (
    <div className="text-gray-700">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wider font-medium text-gray-600">Open Incidents</p>
          <p className="mt-3 text-2xl font-bold text-blue-600">{loading ? '…' : openIncidents}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wider font-medium text-gray-600">High Severity Alerts</p>
          <p className="mt-3 text-2xl font-bold text-red-600">{loading ? '…' : highSeverityAlerts}</p>
        </div>
      </div>
    </div>
  );
};

export default IncidentTable;
