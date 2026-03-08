import React from "react";
import "../styles/dashboard.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Security Operations Dashboard</span>
      </div>
      <nav>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item active">Dashboard</li>
          <li className="sidebar-nav-item">Alerts</li>
          <li className="sidebar-nav-item">Incidents</li>
          <li className="sidebar-nav-item">Analytics</li>
        </ul>
      </nav>
      <div className="sidebar-footer">v0.1</div>
    </div>
  );
}

export default Sidebar;