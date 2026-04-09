import publicClient from './client/public.client';

const simulationEndpoints = {
  state: 'detection/simulation/',
  configure: 'detection/simulation/configure/',
  trigger: 'detection/simulation/trigger/',
};

const simulationApi = {
  fetchSimulationState: async () => {
    try {
      const response = await publicClient.get(simulationEndpoints.state);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  updateSimulationConfig: async (data) => {
    try {
      const response = await publicClient.post(simulationEndpoints.configure, data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  triggerSimulation: async (action) => {
    try {
      const response = await publicClient.post(simulationEndpoints.trigger, { action });
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default simulationApi;
