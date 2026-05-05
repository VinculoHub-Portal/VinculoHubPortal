import type { useAuth0 } from "@auth0/auth0-react";

const ROLES_CLAIM = "https://vinculohub/roles";

export function resolveDashboardPath(
  user: ReturnType<typeof useAuth0>["user"],
): string {
  const raw = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM];
  const roles: string[] = Array.isArray(raw) ? raw : [];
  const upper = roles.map((r) => String(r).toUpperCase());
  if (upper.includes("ADMIN")) return "/admin/dashboard";
  if (upper.includes("NPO")) return "/ong/dashboard";
  if (upper.includes("COMPANY")) return "/empresa/dashboard";
  return "/";
}
