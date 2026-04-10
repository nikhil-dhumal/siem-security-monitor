import apiClient from './client';

const simulationEndpoints = {
  state: 'detection/simulation/',
  configure: 'detection/simulation/configure/',
  trigger: 'detection/simulation/trigger/',
};

const simulationApi = {
  fetchSimulationState: async () => {
    try {
      const response = await apiClient.get(simulationEndpoints.state);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  updateSimulationConfig: async (data) => {
    try {
      const response = await apiClient.post(simulationEndpoints.configure, data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  triggerSimulation: async (action) => {
    try {
      const response = await apiClient.post(simulationEndpoints.trigger, { action });
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default simulationApi;
