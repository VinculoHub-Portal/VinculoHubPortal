import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

export const useAuthenticatedApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  return useMemo(() => {
    const authenticatedApi = axios.create({
      baseURL: apiBaseUrl,
    });

    authenticatedApi.interceptors.request.use(async (config) => {
      const token = await getAccessTokenSilently();
      config.headers.set('Authorization', `Bearer ${token}`);
      return config;
    });

    return authenticatedApi;
  }, [getAccessTokenSilently]);
};
