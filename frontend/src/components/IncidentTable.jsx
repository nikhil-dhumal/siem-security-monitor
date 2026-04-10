import { useEffect, useState } from 'react';
import incidentsApi from '../api/incidentsApi';

const IncidentTable = ({ incidents = [] }) => {
  const [statsData, setStatsData] = useState({ openIncidents: 0, highSeverityAlerts: 0 });
  const [loading, setLoading] = useState(true);

  // Load statistics if incidents array is empty (for backward compatibility)
  useEffect(() => {
    if (incidents.length > 0) {
      setLoading(false);
      return;
    }

    const loadIncidents = async () => {
      setLoading(true);
      const { response, err } = await incidentsApi.fetchIncidents({ page_size: 50 });
      if (err) {
        setStatsData({ openIncidents: 0, highSeverityAlerts: 0 });
      } else {
        const incidentList = response.results || response;
        setStatsData({
          openIncidents: incidentList.length,
          highSeverityAlerts: incidentList.reduce((sum, item) => sum + (item.high_severity_alerts || 0), 0),
        });
      }
      setLoading(false);
    };

    loadIncidents();
  }, [incidents.length]);

  // If incidents array is provided, display as table
  if (incidents.length > 0) {
    return (
      <div className="overflow-y-auto h-full">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Title</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900 font-medium">{incident.title}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{incident.description}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`inline-block px-2 py-1 rounded font-medium ${
                    incident.status === 'open' ? 'bg-red-100 text-red-800' :
                    incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {incident.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(incident.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Otherwise show stats (for backward compatibility when used without incidents prop)
  return (
    <div className="text-gray-700">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wider font-medium text-gray-600">Open Incidents</p>
          <p className="mt-3 text-2xl font-bold text-blue-600">{loading ? '…' : statsData.openIncidents}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wider font-medium text-gray-600">High Severity Alerts</p>
          <p className="mt-3 text-2xl font-bold text-red-600">{loading ? '…' : statsData.highSeverityAlerts}</p>
        </div>
      </div>
    </div>
  );
};

export default IncidentTable;
