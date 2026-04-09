import publicClient from './client/public.client';

const incidentEndpoints = {
  list: 'incidents/',
  detail: (id) => `incidents/${id}/`,
};

const incidentsApi = {
  fetchIncidents: async (params = {}) => {
    try {
      const response = await publicClient.get(incidentEndpoints.list, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default incidentsApi;
