import axios from 'axios';
import queryString from 'query-string';

const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URL || ''}/api`;

const publicClient = axios.create({
  baseURL,
  paramsSerializer: (params) => queryString.stringify(params),
});

publicClient.interceptors.request.use(async (config) => ({
  ...config,
  headers: {
    'Content-Type': 'application/json',
  },
}));

publicClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (err) => {
    throw err.response?.data || err;
  }
);

export default publicClient;
