import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const ROLES_CLAIM = "https://vinculohub/roles";

type UserRole = "ADMIN" | "NPO" | "COMPANY";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: UserRole;
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();

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

  if (requiredRole) {
    const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM];
    const userRoles: string[] = Array.isArray(rawRoles) ? rawRoles : [];
    const hasRole = userRoles.some((r) => r.toUpperCase() === requiredRole);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
