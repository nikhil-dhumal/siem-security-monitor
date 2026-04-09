import privateClient from './client/private.client';

const rulesEndpoints = {
  list: 'rules/',
  detail: (id) => `rules/${id}/`,
};

const rulesApi = {
  fetchRules: async () => {
    try {
      const response = await privateClient.get(rulesEndpoints.list);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  updateRule: async (id, data) => {
    try {
      const response = await privateClient.patch(rulesEndpoints.detail(id), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default rulesApi;
