import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type UserRole = "ADMIN" | "NPO" | "COMPANY" | "UNKNOWN";

type TokenPayload = {
  [rolesClaim]?: string[];
};

const loginCompletedKey = "auth0-login-completed";
const rolesClaim = "https://vinculohub/roles";

export function AuthRoleRedirect() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem(loginCompletedKey) === "true";

    if (!shouldRedirect || isLoading || !isAuthenticated) {
      return;
    }

    sessionStorage.removeItem(loginCompletedKey);

    async function redirectByRole() {
      try {
        const token = await getAccessTokenSilently();
        const tokenRoles = getRolesFromToken(token);
        const userRoles = getRolesFromUser(user);
        const role = resolvePrimaryRole([...tokenRoles, ...userRoles]);
        const redirectPath = redirectPathForRole(role);

        console.info("Roles Auth0 detectadas:", {
          tokenRoles,
          userRoles,
          selectedRole: role,
          redirectPath,
        });

        if (redirectPath !== location.pathname) {
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.error("Erro ao redirecionar por role:", error);
        navigate("/cadastro", { replace: true });
      }
    }

    void redirectByRole();
  }, [getAccessTokenSilently, isAuthenticated, isLoading, location.pathname, navigate, user]);

  return null;
}

function getRolesFromToken(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return [];
  }

  const decodedPayload = JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  return decodedPayload[rolesClaim] ?? [];
}

function getRolesFromUser(user: unknown) {
  if (!user || typeof user !== "object") {
    return [];
  }

  const roles = (user as TokenPayload)[rolesClaim];
  return Array.isArray(roles) ? roles : [];
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(paddedBase64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function resolvePrimaryRole(roles: string[]): UserRole {
  const normalizedRoles = roles.map((role) => role.toUpperCase());

  if (normalizedRoles.includes("ADMIN")) {
    return "ADMIN";
  }

  if (normalizedRoles.includes("NPO")) {
    return "NPO";
  }

  if (normalizedRoles.includes("COMPANY")) {
    return "COMPANY";
  }

  return "UNKNOWN";
}

function redirectPathForRole(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "NPO":
      return "/ong/dashboard";
    case "COMPANY":
      return "/empresa/dashboard";
    default:
      return "/cadastro";
  }
}
