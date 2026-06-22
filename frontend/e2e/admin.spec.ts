import { test, expect } from "@playwright/test";
import { PERSONAS } from "./helpers/credentials";

test.describe("Persona ADMIN", () => {
  test.use({ storageState: PERSONAS.admin.storageState });

  test("E2E-ADM-01 dashboard exibe 4 métricas reais", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Painel administrativo" }),
    ).toBeVisible();
    // Os 4 cards de métrica (article[aria-label="Label: valor"]).
    for (const label of [
      "Total de ONGs",
      "Editais Publicados",
      "Vínculos Ativos",
      "Notificações Pendentes",
    ]) {
      await expect(
        page.locator(`article[aria-label^="${label}:"]`),
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("E2E-ADM-02 card Total de ONGs leva a /admin/ongs", async ({ page }) => {
    await page.goto("/admin/dashboard");
    const card = page.locator('article[aria-label^="Total de ONGs:"]');
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.getByRole("link", { name: "Ver todos" }).click();
    await expect(page).toHaveURL(/\/admin\/ongs/);
  });

  test("E2E-ADM-03 card Vínculos Ativos leva a /admin/vinculos", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    const card = page.locator('article[aria-label^="Vínculos Ativos:"]');
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.getByRole("link", { name: "Ver todos" }).click();
    await expect(page).toHaveURL(/\/admin\/vinculos/);
  });

  test("E2E-ADM-06 seção de denúncias lista a ONG denunciada (OPEN)", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Denúncias de ONGs" }),
    ).toBeVisible();
    // Aba OPEN é o padrão: deve mostrar a denúncia aberta de Instituto Cidadania.
    await expect(page.getByText("Instituto Cidadania").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("E2E-ADM-07 filtro de denúncias por status (RESOLVED)", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Denúncias de ONGs" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Resolvida" }).click();
    await expect(page.getByRole("tab", { name: "Resolvida" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Há 1 denúncia RESOLVED seedada (Instituto Cidadania por Empresa Multipla).
    await expect(page.getByText("Instituto Cidadania").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("E2E-ADM-08 botão Notificações abre /admin/notificacoes", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: "Notificações" }).click();
    await expect(page).toHaveURL(/\/admin\/notificacoes/);
  });

  test("E2E-ADM-04 listagem de ONGs abre sem 404", async ({ page }) => {
    await page.goto("/admin/ongs");
    await expect(page.getByText("Instituto", { exact: false }).first()).toBeVisible(
      { timeout: 15000 },
    );
  });

  test("E2E-ADM-05 listagem de vínculos abre sem 404", async ({ page }) => {
    await page.goto("/admin/vinculos");
    // A página renderiza sem cair em rota inexistente.
    await expect(page).toHaveURL(/\/admin\/vinculos/);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
