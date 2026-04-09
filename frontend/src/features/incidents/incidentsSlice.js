import { createSlice } from '@reduxjs/toolkit';

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setIncidents(state, action) {
      state.list = action.payload;
    },
    setIncidentsLoading(state, action) {
      state.loading = action.payload;
    },
    setIncidentsError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setIncidents, setIncidentsLoading, setIncidentsError } = incidentsSlice.actions;
export default incidentsSlice.reducer;
