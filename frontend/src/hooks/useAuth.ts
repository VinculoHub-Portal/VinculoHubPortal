import { useAuth0 } from "@auth/auth0-react";

export function useAuth() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } =
    useAuth0();

  return {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  };
}
