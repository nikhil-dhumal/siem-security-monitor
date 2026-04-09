import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logsApi from "../api/logsApi";
import alertsApi from "../api/alertsApi";
import {
  setLogs,
  setLogsLoading,
  setLogsError,
} from "../features/logs/logsSlice";
import {
  setAlerts,
  setAlertsLoading,
  setAlertsError,
} from "../features/alerts/alertsSlice";
import TopBar from "../components/layout/TopBar";
import LogTable from "../components/LogTable";
import AlertTable from "../components/AlertTable";
import IncidentTable from "../components/IncidentTable";
import ThreatMap from "../components/ThreatMap";

const Dashboard = () => {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.logs.list || []);
  const alerts = useSelector((state) => state.alerts.list || []);

  const displayLogs = logs.slice(0, 10);
  const displayAlerts = alerts.slice(0, 10);

  useEffect(() => {
    const loadDashboardData = async () => {
      dispatch(setLogsLoading(true));
      dispatch(setAlertsLoading(true));

      const { response: logResponse, err: logErr } = await logsApi.fetchLogs({
        page_size: 20,
      });
      if (logErr) {
        dispatch(setLogsError(logErr?.message || "Failed to fetch logs"));
      } else {
        dispatch(setLogs(logResponse?.results || logResponse || []));
      }
      dispatch(setLogsLoading(false));

      const { response: alertResponse, err: alertErr } =
        await alertsApi.fetchAlerts({ page_size: 20 });
      if (alertErr) {
        dispatch(setAlertsError(alertErr?.message || "Failed to fetch alerts"));
      } else {
        dispatch(setAlerts(alertResponse?.results || alertResponse || []));
      }
      dispatch(setAlertsLoading(false));
    };

    loadDashboardData();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      <TopBar title="SIEM Dashboard" />
      <div className="px-6 pb-6 space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Incident Summary
          </h2>
          <IncidentTable />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow h-96 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Recent Logs
            </h2>
            <LogTable logs={displayLogs} />
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow h-96 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Latest Alerts
            </h2>
            <AlertTable alerts={displayAlerts} />
          </section>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow h-[60vh] overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Threat Map
          </h2>
          <div className="h-[calc(60vh-6rem)]">
            <ThreatMap />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
