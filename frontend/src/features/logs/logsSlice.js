import { createSlice } from '@reduxjs/toolkit';

const logsSlice = createSlice({
  name: 'logs',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLogs: (state, action) => {
      state.list = action.payload;
    },
    addLog: (state, action) => {
      state.list.unshift(action.payload); // Add to beginning for latest first
    },
    setLogsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLogsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setLogs, addLog, setLogsLoading, setLogsError } = logsSlice.actions;
export default logsSlice.reducer;
