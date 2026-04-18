import axios from 'axios';
import { logger } from '../utils/logger';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  logger.info("HTTP", `→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    logger.info("HTTP", `← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? "NETWORK_ERROR";
      const data = error.response?.data;
      logger.error("HTTP", `← ${status} ${error.config?.url}`, data);
    } else {
      logger.error("HTTP", "Request failed", error);
    }
    return Promise.reject(error);
  },
);
