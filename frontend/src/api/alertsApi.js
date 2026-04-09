import publicClient from './client/public.client';

const alertEndpoints = {
  list: 'alerts/',
  detail: (id) => `alerts/${id}/`,
};

const alertsApi = {
  fetchAlerts: async (params = {}) => {
    try {
      const response = await publicClient.get(alertEndpoints.list, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchAlertById: async (id) => {
    try {
      const response = await publicClient.get(alertEndpoints.detail(id));
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default alertsApi;
