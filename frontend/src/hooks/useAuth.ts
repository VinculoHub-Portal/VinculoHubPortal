import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();

  return {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  };
};
