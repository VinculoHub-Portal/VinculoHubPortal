import { test, expect } from "@playwright/test";
import { PERSONAS } from "./helpers/credentials";

test.describe("Persona ONG — npo.projects", () => {
  test.use({ storageState: PERSONAS.npoProjects.storageState });

  test("E2E-ONG-01 dashboard exibe projetos e métricas", async ({ page }) => {
    await page.goto("/ong/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard da ONG" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Projetos por Tipo" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Status dos Projetos" }),
    ).toBeVisible();
    // Projeto seedado deve aparecer.
    await expect(page.getByText("Educacao para Todos")).toBeVisible({
      timeout: 15000,
    });
  });

  test("E2E-ONG 'Projetos por Tipo' contabiliza as modalidades reais", async ({
    page,
  }) => {
    await page.goto("/ong/dashboard");
    const card = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "Projetos por Tipo" }) });
    // Antes do fix do seeder o card vinha vazio (project_type fora de
    // TAX_INCENTIVE_LAW/SOCIAL_INVESTMENT_LAW não era contabilizado).
    await expect(card.getByText("Leis de Incentivo")).toBeVisible({
      timeout: 15000,
    });
    await expect(card.getByText("Investimento Social Privado")).toBeVisible();
    // npo_projects tem 2 projetos TAX_INCENTIVE_LAW seedados (Educacao, Bairros).
    await expect(
      card.locator("div").filter({ hasText: "Leis de Incentivo" }).last(),
    ).toContainText("2 projetos");
  });

  test("E2E-ONG-02 'Ver todos' leva a /ong/projetos", async ({ page }) => {
    await page.goto("/ong/dashboard");
    await page.getByRole("button", { name: "Ver todos", exact: true }).click();
    await expect(page).toHaveURL(/\/ong\/projetos/);
    await expect(
      page.getByRole("heading", { name: "Meus Projetos" }),
    ).toBeVisible();
  });

  test("E2E-ONG-03 filtro por status no dashboard não esvazia a tela", async ({
    page,
  }) => {
    await page.goto("/ong/dashboard");
    await expect(page.getByText("Educacao para Todos")).toBeVisible({
      timeout: 15000,
    });
    // Clica no chip "Ativos" do card Status dos Projetos.
    await page.getByRole("button", { name: "Ativos", exact: true }).click();
    // Projetos ATIVOS continuam visíveis (todos os seedados são ATIVOS).
    await expect(page.getByText("Educacao para Todos")).toBeVisible();
  });

  test("E2E-ONG-11 perfil privado carrega", async ({ page }) => {
    await page.goto("/ong/perfil");
    await expect(
      page.getByRole("heading", { name: "Informações da Organização" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Documentos privados" }),
    ).toBeVisible();
  });

  test("E2E-ONG-17 mural de editais lista editais", async ({ page }) => {
    await page.goto("/editais");
    await expect(
      page.getByRole("heading", { name: "Mural de Editais" }),
    ).toBeVisible({ timeout: 15000 });
  });
});
