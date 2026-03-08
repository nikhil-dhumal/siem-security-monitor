import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api"
});

export const fetchAlerts = () => api.get("/alerts/");
export const fetchIncidents = () => api.get("/incidents/");
export const fetchAnalytics = () => api.get("/analytics/");