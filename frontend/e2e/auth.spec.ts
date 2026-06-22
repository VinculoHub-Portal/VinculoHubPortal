import { test, expect } from "@playwright/test";
import { PERSONAS } from "./helpers/credentials";

// Header por papel (E2E-AUTH-08): admin NÃO vê "Vínculos"; empresa/ONG veem.
test.describe("Header por papel — empresa", () => {
  test.use({ storageState: PERSONAS.companyMultiple.storageState });

  test("E2E-AUTH-08 empresa vê link Vínculos", async ({ page }) => {
    await page.goto("/empresa/dashboard");
    await expect(
      page.getByRole("link", { name: "Vínculos", exact: true }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("E2E-AUTH-07 logout volta para a landing", async ({ page }) => {
    await page.goto("/empresa/dashboard");
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost\/?$/, { timeout: 15000 });
    await expect(
      page.getByRole("button", { name: "Entrar" }),
    ).toBeVisible();
  });
});

test.describe("Header por papel — ONG", () => {
  test.use({ storageState: PERSONAS.npoProjects.storageState });

  test("E2E-AUTH-08 ONG vê link Vínculos", async ({ page }) => {
    await page.goto("/ong/dashboard");
    await expect(
      page.getByRole("link", { name: "Vínculos", exact: true }),
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Header por papel — admin", () => {
  test.use({ storageState: PERSONAS.admin.storageState });

  test("E2E-AUTH-08 admin NÃO vê link Vínculos", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "Painel administrativo" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: "Vínculos", exact: true })).toHaveCount(0);
  });
});

// GuestOnlyRoute (PR #320, Bug 3): usuário autenticado com cadastro completo
// não acessa /cadastro — é redirecionado ao dashboard do seu papel.
test.describe("GuestOnlyRoute — /cadastro bloqueado para logados", () => {
  test("ONG logada em /cadastro/instituicao vai para /ong/dashboard", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: PERSONAS.npoProjects.storageState,
    });
    const page = await context.newPage();
    try {
      await page.goto("/cadastro/instituicao");
      await expect(page).toHaveURL(/\/ong\/dashboard/, { timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("Empresa logada em /cadastro vai para /empresa/dashboard", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: PERSONAS.companyMultiple.storageState,
    });
    const page = await context.newPage();
    try {
      await page.goto("/cadastro");
      await expect(page).toHaveURL(/\/empresa\/dashboard/, { timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("Admin logado em /cadastro vai para /admin/dashboard", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: PERSONAS.admin.storageState,
    });
    const page = await context.newPage();
    try {
      await page.goto("/cadastro");
      await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    } finally {
      await context.close();
    }
  });
});
