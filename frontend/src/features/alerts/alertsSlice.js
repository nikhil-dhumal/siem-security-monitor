import { createSlice } from '@reduxjs/toolkit';

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setAlerts: (state, action) => {
      state.list = action.payload;
    },
    addAlert: (state, action) => {
      state.list.unshift(action.payload); // Add to beginning for latest first
    },
    setAlertsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAlertsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAlerts, addAlert, setAlertsLoading, setAlertsError } = alertsSlice.actions;
export default alertsSlice.reducer;
