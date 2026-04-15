import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, type ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: {
          returnTo: window.location.pathname,
        },
        authorizationParams: {
          ui_locales: 'pt-BR',
        },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return <p>Carregando...</p>;
  }

  return children;
}
