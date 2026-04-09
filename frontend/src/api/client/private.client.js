import axios from 'axios';
import queryString from 'query-string';

const baseURL = `${import.meta.env.VITE_BACKEND_BASE_URL || ''}/api`;

const privateClient = axios.create({
  baseURL,
  paramsSerializer: (params) => queryString.stringify(params),
});

privateClient.interceptors.request.use(async (config) => ({
  ...config,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('actkn')}`,
  },
}));

privateClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (err) => {
    throw err.response?.data || err;
  }
);

export default privateClient;
