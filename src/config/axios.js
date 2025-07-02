import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const config = {
  baseUrl: baseUrl,
};

const api = axios.create(config);

api.defaults.baseURL = baseUrl;

const handleBefore = (config) => {
  const token = localStorage.getItem("token")?.replaceAll('"', "");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
};

api.interceptors.request.use(handleBefore, null);

export default api;
