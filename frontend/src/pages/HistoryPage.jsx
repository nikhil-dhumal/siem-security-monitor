import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import TopBar from '../components/layout/TopBar';
import LogTable from '../components/LogTable';
import AlertTable from '../components/AlertTable';
import logsApi from '../api/logsApi';
import alertsApi from '../api/alertsApi';
import incidentsApi from '../api/incidentsApi';

const IncidentList = React.memo(({ incidents }) => (
  <div className="space-y-2">
    {incidents.map((incident) => (
      <div key={incident.id} className="p-4 border border-gray-200 rounded bg-gray-50">
        <p className="font-medium text-sm text-gray-900">{incident.title}</p>
        <p className="text-xs text-gray-600 mt-1">{incident.description}</p>
        <p className="text-xs text-gray-500 mt-2">Status: <span className="font-semibold">{incident.status}</span></p>
        <p className="text-xs text-gray-500">Created: {new Date(incident.created_at).toLocaleString()}</p>
      </div>
    ))}
    {incidents.length === 0 && <p className="text-sm text-gray-400 text-center">No incidents found</p>}
  </div>
));

const HistoryPage = () => {
  const authState = useSelector((state) => state.auth);
  useEffect(() => {
  }, [authState]);
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [error, setError] = useState(null);

  const pageSize = 10;

  const fetchData = async (tab, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      let response = null;
      let err = null;

      if (tab === 'logs') {
        ({ response, err } = await logsApi.fetchLogs({ page_size: pageSize, page }));
        setLogs(response?.results || response || []);
      } else if (tab === 'alerts') {
        ({ response, err } = await alertsApi.fetchAlerts({ page_size: pageSize, page }));
        setAlerts(response?.results || response || []);
      } else if (tab === 'incidents') {
        ({ response, err } = await incidentsApi.fetchIncidents({ page_size: pageSize, page }));
        setIncidents(response?.results || response || []);
      }

      if (err) {
        console.error('Error fetching data:', err);
        setError(err?.message || 'Unable to load history data');
      }

      if (response) {
        const countValue = typeof response.count === 'number'
          ? response.count
          : Array.isArray(response)
            ? response.length
            : response?.results?.length ?? 0;
        setCount(countValue);
        const pages = Math.max(1, Math.ceil(countValue / pageSize));
        setTotalPages(pages);
        setHasPrev(page > 1);
        setHasNext(page < pages || !!response?.next);
      }
    } catch (fetchError) {
      console.error('Error fetching data:', fetchError);
      setError(fetchError?.message || 'Unable to load history data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);

  const handleNext = useCallback(() => {
    if (hasNext) setCurrentPage(currentPage + 1);
  }, [hasNext, currentPage]);

  const handlePrev = useCallback(() => {
    if (hasPrev) setCurrentPage(currentPage - 1);
  }, [hasPrev, currentPage]);

  const [pageInput, setPageInput] = useState('');

  const handleGoToPage = () => {
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
    setPageInput('');
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'logs':
        return <LogTable logs={logs} />;
      case 'alerts':
        return <AlertTable alerts={alerts} />;
      case 'incidents':
        return <IncidentList incidents={incidents} />;
      default:
        return null;
    }
  }, [activeTab, loading, logs, alerts, incidents]);

  return (
    <div className="h-screen bg-white flex flex-col">
      <TopBar title="History" />
      <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
        <section className="mt-6">
          <nav className="flex items-center gap-2">
            {[
              { key: 'logs', label: 'Logs' },
              { key: 'alerts', label: 'Alerts' },
              { key: 'incidents', label: 'Incidents' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </section>

        <section className="mt-6 flex-1 min-h-0 rounded-lg border border-gray-200 bg-white p-6 shadow flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            {error ? (
              <div className="flex h-full items-center justify-center text-sm text-red-500">
                {error}
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={!hasPrev || loading}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyPress={handlePageInputKeyPress}
                  placeholder={currentPage.toString()}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleGoToPage}
                  disabled={!pageInput || loading}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go
                </button>
              </div>
              <button
                onClick={handleNext}
                disabled={!hasNext || loading}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HistoryPage;