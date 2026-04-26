import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { registerCompany, type CompanyRegistrationPayload } from "../../api/company";
import { api } from "../../services/api";
import type { WizardFormData } from "../../types/wizard.types";
import { logger } from "../../utils/logger";

type UserRole = "ADMIN" | "NPO" | "COMPANY" | "UNKNOWN";

type TokenPayload = {
  [rolesClaim]?: string[];
};

type NpoSignupDraft = {
  formData?: WizardFormData;
};

type CompanySignupDraft = {
  payload?: CompanyRegistrationPayload;
};

type Auth0User = {
  email?: string;
};

type AuthenticatedProfile = {
  userType?: "admin" | "npo" | "company" | null;
  npoId?: number | null;
  companyId?: number | null;
  registrationCompleted: boolean;
};

const loginCompletedKey = "auth0-login-completed";
const npoSignupDraftKey = "vinculohub:npo-signup-draft";
const companySignupDraftKey = "vinculohub:company-signup-draft";
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
        logger.info("AuthRedirect", "Acquiring access token...");
        const token = await getAccessTokenSilently();
        logger.info("AuthRedirect", "Token acquired");

        const hasNpoDraft = sessionStorage.getItem(npoSignupDraftKey) !== null;
        const hasCompanyDraft = sessionStorage.getItem(companySignupDraftKey) !== null;
        logger.info("AuthRedirect", "Draft check", { hasNpoDraft, hasCompanyDraft });

        let npoDraftSubmitted = false;
        let companyDraftSubmitted = false;

        if (hasNpoDraft) {
          try {
            logger.info("AuthRedirect", "Submitting NPO draft...");
            await submitNpoSignupDraft(token, user);
            npoDraftSubmitted = true;
            logger.info("AuthRedirect", "NPO draft submitted successfully");
          } catch (error) {
            logger.error("AuthRedirect", "NPO draft submission failed", getErrorMessage(error));
          }
        }

        if (hasCompanyDraft) {
          try {
            logger.info("AuthRedirect", "Submitting company draft...");
            await submitCompanySignupDraft(token, user);
            companyDraftSubmitted = true;
            logger.info("AuthRedirect", "Company draft submitted successfully");
          } catch (error) {
            logger.error("AuthRedirect", "Company draft submission failed", getErrorMessage(error));
          }
        }

        logger.info("AuthRedirect", "Fetching authenticated profile...");
        const profile = await getAuthenticatedProfile(token);
        logger.info("AuthRedirect", "Profile loaded", profile);

        const tokenRoles = getRolesFromToken(token);
        const userRoles = getRolesFromUser(user);
        const role = profileRole(profile) ?? resolvePrimaryRole([...tokenRoles, ...userRoles]);
        const redirectPath = redirectPathAfterSignupDraft({
          profile,
          role,
          npoDraftSubmitted: npoDraftSubmitted || hasNpoDraft,
          companyDraftSubmitted: companyDraftSubmitted || hasCompanyDraft,
        });

        logger.info("AuthRedirect", "Role resolution complete", {
          tokenRoles,
          userRoles,
          selectedRole: role,
          profileUserType: profile?.userType,
          registrationCompleted: profile?.registrationCompleted,
          redirectPath,
        });

        if (redirectPath !== location.pathname) {
          logger.info("AuthRedirect", `Navigating to ${redirectPath}`);
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        logger.error("AuthRedirect", "Redirect by role failed", error);
        navigate("/cadastro", { replace: true });
      }
    }

    void redirectByRole();
  }, [getAccessTokenSilently, isAuthenticated, isLoading, location.pathname, navigate, user]);

  return null;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? error.message;
  }

  return String(error);
}

async function getAuthenticatedProfile(token: string) {
  try {
    const response = await api.get<AuthenticatedProfile>("/api/me/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    logger.error("AuthRedirect", "Failed to load authenticated profile", error);
    return null;
  }
}

async function submitNpoSignupDraft(token: string, user: unknown) {
  const savedDraft = sessionStorage.getItem(npoSignupDraftKey);

  if (!savedDraft) {
    return;
  }

  const draft = JSON.parse(savedDraft) as NpoSignupDraft;
  const formData = draft.formData;

  if (!formData) {
    return;
  }

  await api.post(
    "/api/npo-accounts",
    {
      name: formData.nomeInstituicao,
      email: getUserEmail(user),
      cpf: formData.cpf,
      cnpj: formData.cnpj || null,
      npoSize: formData.porteOng,
      description: formData.resumoInstitucional || null,
      phone: formData.phone || null,
      environmental: formData.esg.includes("ambiental"),
      social: formData.esg.includes("social"),
      governance: formData.esg.includes("governanca"),
      address: formData.zipCode
        ? {
            state: formData.state || null,
            stateCode: formData.stateCode || null,
            city: formData.city || null,
            street: formData.street || null,
            number: formData.streetNumber || null,
            complement: formData.complement || null,
            zipCode: formData.zipCode,
          }
        : null,
      firstProject: {
        name: formData.nomeProjeto,
        description: formData.descricaoProjeto,
        capital: formData.metaCaptacao.trim() ? Number(formData.metaCaptacao) : null,
        ods: formData.odsProjeto,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  sessionStorage.removeItem(npoSignupDraftKey);
}

async function submitCompanySignupDraft(token: string, user: unknown) {
  const savedDraft = sessionStorage.getItem(companySignupDraftKey);

  if (!savedDraft) {
    logger.warn("AuthRedirect", "Company draft key exists but value is empty");
    return;
  }

  const draft = JSON.parse(savedDraft) as CompanySignupDraft;
  const payload = draft.payload;

  if (!payload) {
    logger.warn("AuthRedirect", "Company draft parsed but payload is missing");
    return;
  }

  const email = getUserEmail(user) ?? payload.email;
  logger.info("AuthRedirect", "Calling registerCompany", { cnpj: payload.cnpj, email });

  await registerCompany(
    {
      ...payload,
      email,
    },
    token,
  );

  sessionStorage.removeItem(companySignupDraftKey);
  logger.info("AuthRedirect", "Company draft removed from sessionStorage");
}

function getUserEmail(user: unknown) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return (user as Auth0User).email ?? null;
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

function redirectPathAfterSignupDraft({
  profile,
  role,
  npoDraftSubmitted,
  companyDraftSubmitted,
}: {
  profile: AuthenticatedProfile | null;
  role: UserRole;
  npoDraftSubmitted: boolean;
  companyDraftSubmitted: boolean;
}) {
  if (profile?.registrationCompleted) {
    if (npoDraftSubmitted && profile.npoId) {
      return "/ong/dashboard";
    }

    if (companyDraftSubmitted && profile.companyId) {
      return "/empresa/dashboard";
    }
  }

  return redirectPathForRole(role);
}

function profileRole(profile: AuthenticatedProfile | null): UserRole | null {
  if (!profile?.registrationCompleted) {
    return null;
  }

  switch (profile.userType) {
    case "admin":
      return "ADMIN";
    case "npo":
      return "NPO";
    case "company":
      return "COMPANY";
    default:
      return null;
  }
}
