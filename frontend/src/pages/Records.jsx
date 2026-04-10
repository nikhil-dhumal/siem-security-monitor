import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import logsApi from '../api/logsApi';
import alertsApi from '../api/alertsApi';
import incidentsApi from '../api/incidentsApi';
import TopBar from '../components/layout/TopBar';
import LogTable from '../components/LogTable';
import AlertTable from '../components/AlertTable';
import IncidentTable from '../components/IncidentTable';

const ITEMS_PER_PAGE = 50;

const Records = () => {
  const authState = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('logs');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = useMemo(() => Math.ceil(totalCount / ITEMS_PER_PAGE) || 1, [totalCount]);

  // Lazy load logs only when logs tab is active
  useEffect(() => {
    if (activeTab !== 'logs') return;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      setError(null);
      try {
        const { response, err } = await logsApi.fetchLogs({
          page: page,
          page_size: ITEMS_PER_PAGE,
        });

        if (err) {
          setError(err?.message || 'Failed to fetch logs');
          setLogs([]);
        } else {
          setLogs(response?.results || response || []);
          setTotalCount(response?.count || 0);
        }
      } catch (e) {
        setError('An error occurred while fetching logs');
        setLogs([]);
      }
      setLoadingLogs(false);
    };

    fetchLogs();
  }, [activeTab, page]);

  // Lazy load alerts only when alerts tab is active
  useEffect(() => {
    if (activeTab !== 'alerts') return;

    const fetchAlerts = async () => {
      setLoadingAlerts(true);
      setError(null);
      try {
        const { response, err } = await alertsApi.fetchAlerts({
          page: page,
          page_size: ITEMS_PER_PAGE,
        });

        if (err) {
          setError(err?.message || 'Failed to fetch alerts');
          setAlerts([]);
        } else {
          setAlerts(response?.results || response || []);
          setTotalCount(response?.count || 0);
        }
      } catch (e) {
        setError('An error occurred while fetching alerts');
        setAlerts([]);
      }
      setLoadingAlerts(false);
    };

    fetchAlerts();
  }, [activeTab, page]);

  // Lazy load incidents only when incidents tab is active
  useEffect(() => {
    if (activeTab !== 'incidents') return;

    const fetchIncidents = async () => {
      setLoadingIncidents(true);
      setError(null);
      try {
        const { response, err } = await incidentsApi.fetchIncidents({
          page: page,
          page_size: ITEMS_PER_PAGE,
        });

        if (err) {
          setError(err?.message || 'Failed to fetch incidents');
          setIncidents([]);
        } else {
          setIncidents(response?.results || response || []);
          setTotalCount(response?.count || 0);
        }
      } catch (e) {
        setError('An error occurred while fetching incidents');
        setIncidents([]);
      }
      setLoadingIncidents(false);
    };

    fetchIncidents();
  }, [activeTab, page]);

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setTotalCount(0);
    setError(null);
  };

  const isLoading = activeTab === 'logs' ? loadingLogs : activeTab === 'alerts' ? loadingAlerts : activeTab === 'incidents' ? loadingIncidents : false;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar title="Records & History" />
      <div className="px-6 pb-6 flex flex-col flex-1 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex gap-2 pt-2 mb-3 flex-shrink-0">
          <button
            onClick={() => handleTabChange('logs')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'logs'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => handleTabChange('alerts')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'alerts'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => handleTabChange('incidents')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'incidents'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Incidents
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Content Area - Fills remaining space */}
        <div className="flex-1 rounded-lg border border-gray-200 bg-white shadow flex flex-col overflow-hidden">
          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="flex flex-col h-full p-4 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">All Logs</h2>
              <div className="flex-1 overflow-hidden">
                {isLoading && logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Loading logs...
                  </div>
                ) : logs.length > 0 ? (
                  <div className="h-full overflow-y-auto">
                    <LogTable logs={logs} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No logs found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="flex flex-col h-full p-4 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">All Alerts</h2>
              <div className="flex-1 overflow-hidden">
                {isLoading && alerts.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Loading alerts...
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="h-full overflow-y-auto">
                    <AlertTable alerts={alerts} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No alerts found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="flex flex-col h-full p-4 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">All Incidents</h2>
              <div className="flex-1 overflow-hidden">
                {isLoading && incidents.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Loading incidents...
                  </div>
                ) : incidents.length > 0 ? (
                  <div className="h-full overflow-y-auto">
                    <IncidentTable incidents={incidents} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No incidents found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between flex-shrink-0 bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
            {totalCount > 0 && ` (${totalCount} total)`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || isLoading}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                page === 1 || isLoading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages || isLoading}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                page >= totalPages || isLoading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Records;
