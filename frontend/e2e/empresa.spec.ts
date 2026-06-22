import { test, expect, type Page } from "@playwright/test";
import { PERSONAS } from "./helpers/credentials";

// Helper: localiza o card de vínculo de um projeto pelo nome do projeto (h2).
function vinculoCard(page: Page, projectName: string) {
  return page
    .locator(".MuiCard-root")
    .filter({ has: page.getByRole("heading", { level: 2, name: projectName }) });
}

test.describe("Persona EMPRESA — company.multiple", () => {
  test.use({ storageState: PERSONAS.companyMultiple.storageState });

  test("E2E-EMP-01 dashboard exibe nome real da empresa", async ({ page }) => {
    await page.goto("/empresa/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard Empresarial" }),
    ).toBeVisible();
    // Espera o perfil carregar (sai do fallback "Empresa")
    await expect(page.getByText(/Bem-vindo de volta,/)).toBeVisible();
    await expect(page.getByText(/Bem-vindo de volta,.*Multipla/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test("E2E-EMP-02 card Projetos Apoiados com modalidades reais", async ({
    page,
  }) => {
    await page.goto("/empresa/dashboard");
    const card = page.locator("div.bg-vinculo-green");
    await expect(card.getByText("Projetos Apoiados")).toBeVisible();
    // Os contadores deixam de mostrar o placeholder "..." quando os dados chegam.
    await expect(card.getByText("...", { exact: true })).toHaveCount(0, {
      timeout: 15000,
    });

    // Valor do contador associado a cada rótulo (1ª <span> do bloco da estatística).
    const statValue = (label: string) =>
      card.getByText(label, { exact: true }).locator("xpath=..").locator("span").first();

    // company.multiple tem 1 único vínculo ATIVO: Renda e Autonomia
    // (project_type = SOCIAL_INVESTMENT_LAW) → ativos=1, investimento privado=1,
    // leis de incentivo=0. Valida que o project_type seedado é contabilizado.
    await expect(statValue("Projetos ativos")).toHaveText("1");
    await expect(statValue("Investimento privado")).toHaveText("1");
    await expect(statValue("Leis de incentivo")).toHaveText("0");
  });

  test("E2E-EMP-03 'Ver todos os projetos' leva a /meus-vinculos com filtro Ativos", async ({
    page,
  }) => {
    await page.goto("/empresa/dashboard");
    await page.getByRole("link", { name: "Ver todos os projetos" }).click();
    await expect(page).toHaveURL(/\/meus-vinculos\?filter=active/);
    // O card-resumo "Ativos" deve estar selecionado.
    await expect(
      page.getByRole("button", { name: /Ativos/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("E2E-EMP-04 seção Impacto ESG carrega sem erro", async ({ page }) => {
    await page.goto("/empresa/dashboard");
    await expect(page.getByRole("heading", { name: "Impacto ESG" })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText("Não foi possível carregar o impacto ESG."),
    ).toHaveCount(0);
  });

  test("E2E-EMP-05 vitrine de ONGs lista organizações", async ({ page }) => {
    await page.goto("/empresa/dashboard");
    await expect(
      page.getByRole("heading", { name: "ONGs Cadastradas" }),
    ).toBeVisible();
    // Cada linha de ONG é clicável (role=button) com botão "Ver perfil" (PR #320).
    await expect(
      page.getByRole("button", { name: /Ver perfil de/ }).first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("E2E-EMP-06 abrir perfil público da ONG pela vitrine", async ({ page }) => {
    await page.goto("/empresa/dashboard");
    await page
      .getByRole("button", { name: "Ver perfil de Instituto Projetos Vivos" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ong\/publico\/\d+/);
    await expect(
      page.getByRole("heading", { name: "Projetos Publicados", exact: false }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("E2E-EMP-06b perfil público mostra 'Denunciar ONG' para empresa (PR #320)", async ({
    page,
  }) => {
    await page.goto("/empresa/dashboard");
    await page
      .getByRole("button", { name: "Ver perfil de Instituto Projetos Vivos" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ong\/publico\/\d+/);
    await expect(
      page.getByRole("button", { name: "Denunciar ONG" }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("E2E-EMP-07 card de projeto no perfil público navega para /projeto/:id (PR #320)", async ({
    page,
  }) => {
    await page.goto("/empresa/dashboard");
    await page
      .getByRole("button", { name: "Ver perfil de Instituto Projetos Vivos" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ong\/publico\/\d+/);
    await page.getByRole("link", { name: /Educacao para Todos/ }).click();
    await expect(page).toHaveURL(/\/projeto\/\d+/);
    await expect(
      page.getByRole("button", { name: /Demonstrar Interesse|Interesse já enviado/ }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("E2E-EMP-11 Meus Vínculos lista pending/negotiation/active", async ({
    page,
  }) => {
    await page.goto("/meus-vinculos");
    await expect(
      page.getByRole("heading", { name: "Meus Vínculos" }),
    ).toBeVisible();
    // company.multiple tem 3 vínculos seedados.
    await expect(vinculoCard(page, "Clima em Acao")).toBeVisible({ timeout: 15000 });
    await expect(vinculoCard(page, "Bairros Sustentaveis")).toBeVisible();
    await expect(vinculoCard(page, "Renda e Autonomia")).toBeVisible();
  });

  test("E2E-EMP-12 vínculo recebido (pending) mostra Aceitar/Recusar", async ({
    page,
  }) => {
    await page.goto("/meus-vinculos");
    const card = vinculoCard(page, "Bairros Sustentaveis");
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.getByRole("button", { name: "Aceitar Contato" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Recusar" })).toBeVisible();
  });

  test("E2E-EMP-13 vínculo em negociação permite efetivar/cancelar parceria", async ({
    page,
  }) => {
    await page.goto("/meus-vinculos");
    const card = vinculoCard(page, "Clima em Acao");
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.getByText("Em Negociação").first()).toBeVisible();
    // Negociação sempre permite cancelar; e mostra "Efetivar Parceria" para quem
    // ainda precisa confirmar, ou "Aguardando confirmação" se já confirmou.
    // No seed atual a empresa já confirmou (aguarda a ONG).
    await expect(
      card.getByRole("button", { name: "Cancelar Parceria" }),
    ).toBeVisible();
    const efetivar = card.getByRole("button", { name: "Efetivar Parceria" });
    const aguardando = card.getByText(/Aguardando confirmação/);
    await expect(
      (await efetivar.count()) > 0 ? efetivar : aguardando,
    ).toBeVisible();
  });

  test("E2E-EMP-15 contato oculto em pending e visível em negociação/ativo", async ({
    page,
  }) => {
    await page.goto("/meus-vinculos");
    // Pending (Bairros Sustentaveis): sem bloco de contato.
    const pendingCard = vinculoCard(page, "Bairros Sustentaveis");
    await expect(pendingCard).toBeVisible({ timeout: 15000 });
    await expect(
      pendingCard.getByText("Informações de Contato"),
    ).toHaveCount(0);

    // Negotiation (Clima em Acao): contato revelado.
    await expect(
      vinculoCard(page, "Clima em Acao").getByText("Informações de Contato"),
    ).toBeVisible();

    // Active (Renda e Autonomia): contato revelado.
    await expect(
      vinculoCard(page, "Renda e Autonomia").getByText("Informações de Contato"),
    ).toBeVisible();
  });
});

test.describe("Persona EMPRESA — company.active", () => {
  test.use({ storageState: PERSONAS.companyActive.storageState });

  test("E2E-EMP-02b Leis de incentivo conta vínculo ativo de Lei de Incentivo", async ({
    page,
  }) => {
    await page.goto("/empresa/dashboard");
    const card = page.locator("div.bg-vinculo-green");
    await expect(card.getByText("...", { exact: true })).toHaveCount(0, {
      timeout: 15000,
    });
    const statValue = (label: string) =>
      card.getByText(label, { exact: true }).locator("xpath=..").locator("span").first();

    // company.active: 1 vínculo ATIVO com Educacao para Todos (TAX_INCENTIVE_LAW)
    // → ativos=1, leis de incentivo=1, investimento privado=0.
    await expect(statValue("Projetos ativos")).toHaveText("1");
    await expect(statValue("Leis de incentivo")).toHaveText("1");
    await expect(statValue("Investimento privado")).toHaveText("0");
  });
});

test.describe("Persona EMPRESA — company.empty (sem vínculos)", () => {
  test.use({ storageState: PERSONAS.companyEmpty.storageState });

  test("E2E-EMP Meus Vínculos vazio para empresa sem vínculos", async ({
    page,
  }) => {
    await page.goto("/meus-vinculos");
    await expect(
      page.getByRole("heading", { name: "Meus Vínculos" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Nenhum vínculo encontrado" }),
    ).toBeVisible({ timeout: 15000 });
  });
});
