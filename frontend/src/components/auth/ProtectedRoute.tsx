import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthProfile } from '../../hooks/useAuthProfile';

const ROLES_CLAIM = "https://vinculohub/roles";

type UserRole = "ADMIN" | "NPO" | "COMPANY";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
};

export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
  const { data: profile, isLoading: isProfileLoading } = useAuthProfile();

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

  if (isLoading || !isAuthenticated || isProfileLoading) {
    return <p>Carregando...</p>;
  }

  if (profile?.userId === null) {
    return <Navigate to="/cadastro" replace />;
  }

  const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM];
  const userRoles: string[] = Array.isArray(rawRoles) ? rawRoles : [];

  if (requiredRole) {
    const hasRole = userRoles.some((r) => r.toUpperCase() === requiredRole);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasAny = userRoles.some((r) =>
      requiredRoles.some((req) => r.toUpperCase() === req)
    );
    if (!hasAny) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
