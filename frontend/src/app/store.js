import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import logsReducer from '../features/logs/logsSlice';
import alertsReducer from '../features/alerts/alertsSlice';
import incidentsReducer from '../features/incidents/incidentsSlice';
import rulesReducer from '../features/rules/rulesSlice';
import simulationReducer from '../features/simulation/simulationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    logs: logsReducer,
    alerts: alertsReducer,
    incidents: incidentsReducer,
    rules: rulesReducer,
    simulation: simulationReducer,
  },
});
