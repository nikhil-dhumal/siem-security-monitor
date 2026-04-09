import publicClient from './client/public.client';

const logsEndpoints = {
  list: 'logs/',
  detail: (id) => `logs/${id}/`,
  summary: 'analytics/summary/',
  timeline: 'analytics/timeline/',
  categories: 'analytics/categories/',
  eventTypes: 'analytics/event-types/',
  geo: 'analytics/geo/',
  topIps: 'analytics/top-ips/',
  topHosts: 'analytics/top-hosts/',
  topUsers: 'analytics/top-users/',
  outcomes: 'analytics/outcomes/',
};

const logsApi = {
  fetchLogs: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.list, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchLogById: async (id) => {
    try {
      const response = await publicClient.get(logsEndpoints.detail(id));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchSummary: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.summary, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchTimeline: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.timeline, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchCategories: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.categories, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchEventTypes: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.eventTypes, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchGeo: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.geo, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchTopIps: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.topIps, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchTopHosts: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.topHosts, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchTopUsers: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.topUsers, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  fetchOutcomes: async (params = {}) => {
    try {
      const response = await publicClient.get(logsEndpoints.outcomes, { params });
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default logsApi;
