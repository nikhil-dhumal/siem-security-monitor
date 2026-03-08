import React from "react";
import Sidebar from "../components/sidebar";
import LiveAlerts from "../components/live_alerts";
import AlertsTable from "../components/alerts_table";
import IncidentsTable from "../components/incidents_table";
import AnalyticsCharts from "../components/analytics_charts";

function Dashboard(){

return(

<div style={{ display: "flex" }}>
  <Sidebar />
  <div style={{ flex: 1 }}>
    <LiveAlerts/>
    <AlertsTable/>
    <AnalyticsCharts/>
    <IncidentsTable/>
  </div>
</div>

)

}

export default Dashboard