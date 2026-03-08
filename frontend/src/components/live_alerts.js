import React, { useEffect, useState } from "react";
import { fetchAlerts } from "../api/api_client";

function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts().then(res => {
      setAlerts(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Live Alerts</h2>
      {alerts.length === 0 ? (
        <p>No live alerts.</p>
      ) : (
        alerts.slice(0, 5).map(alert => (
          <div key={alert.id} style={{ marginBottom: "10px" }}>
            <strong>{alert.severity}: {alert.rule}</strong><br />
            <span>User: {alert.user} | IP: {alert.ip_address}</span><br />
            <span>{alert.description}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default LiveAlerts