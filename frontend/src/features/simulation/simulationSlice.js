import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  config: {
    eventRate: 1,
    agentProbabilities: {
      auth: 0.2,
      network: 0.15,
      file: 0.1,
      vpn: 0.1,
      web: 0.15,
      dns: 0.1,
      process: 0.2,
    },
    detailedProbabilities: {
      auth: {
        ssh_login_success: 0.1,
        ssh_login_failure: 0.01,
        invalid_user: 0.05,
        sudo_command: 0.74,
        user_logout: 0.1,
      },
      web: {
        page_access: 0.46,
        login_request: 0.05,
        admin_access_denied: 0.01,
        directory_traversal: 0.01,
        api_access: 0.46,
      },
      dns: {
        dns_query: 0.3,
        internal_lookup: 0.3,
        suspicious_domain: 0.01,
        cloud_lookup: 0.3,
        dns_failure: 0.09,
      },
      process: {
        normal_process: 0.85,
        admin_command: 0.03,
        network_scan: 0.01,
        reverse_shell: 0.01,
        file_download: 0.1,
      },
      file_access: {
        file_read: 0.55,
        file_write: 0.4,
        sensitive_file_read: 0.01,
        file_delete: 0.05,
        config_change: 0.04,
      },
    },
  },
  status: 'idle',
  lastAction: null,
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    setSimulationConfig(state, action) {
      state.config = action.payload;
    },
    setSimulationStatus(state, action) {
      state.status = action.payload;
    },
    setSimulationAction(state, action) {
      state.lastAction = action.payload;
    },
  },
});

export const { setSimulationConfig, setSimulationStatus, setSimulationAction } = simulationSlice.actions;
export default simulationSlice.reducer;
