// Credenciais dos usuários seedados (TestScenarioSeeder).
// Contas de TESTE — senhas vivem no Auth0 de desenvolvimento.
// Sobrescrevível por env (E2E_PASSWORD) para não fixar segredo real, com
// fallback para a senha padrão do cenário seedado documentada em docs/e2e-checklist.md.

const DEFAULT_PASSWORD = process.env.E2E_PASSWORD ?? "Teste123!";

export type PersonaKey =
  | "companyEmpty"
  | "companyActive"
  | "companyMultiple"
  | "npoProjects"
  | "npoReported"
  | "admin";

export type Persona = {
  key: PersonaKey;
  email: string;
  password: string;
  /** Caminho de dashboard esperado após o login. */
  dashboard: string;
  /** Arquivo de storageState gerado pelo setup de autenticação. */
  storageState: string;
};

function persona(
  key: PersonaKey,
  email: string,
  dashboard: string,
): Persona {
  return {
    key,
    email,
    password: DEFAULT_PASSWORD,
    dashboard,
    storageState: `e2e/.auth/${key}.json`,
  };
}

export const PERSONAS: Record<PersonaKey, Persona> = {
  companyEmpty: persona(
    "companyEmpty",
    "e2e.company.empty@vinculohub.test",
    "/empresa/dashboard",
  ),
  companyActive: persona(
    "companyActive",
    "e2e.company.active@vinculohub.test",
    "/empresa/dashboard",
  ),
  companyMultiple: persona(
    "companyMultiple",
    "e2e.company.multiple@vinculohub.test",
    "/empresa/dashboard",
  ),
  npoProjects: persona(
    "npoProjects",
    "e2e.npo.projects@vinculohub.test",
    "/ong/dashboard",
  ),
  npoReported: persona(
    "npoReported",
    "e2e.npo.reported@vinculohub.test",
    "/ong/dashboard",
  ),
  admin: persona("admin", "e2e.admin@vinculohub.test", "/admin/dashboard"),
};

export const ALL_PERSONAS = Object.values(PERSONAS);
