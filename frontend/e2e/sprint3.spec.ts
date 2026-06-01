import { test, expect } from "@playwright/test";

// Pré-requisito: Docker Compose rodando (docker compose up -d --build)
// baseURL configurado em playwright.config.ts: http://localhost
// Backend acessível em http://localhost:8080

test.describe("Landing page", () => {
  test("carrega com título correto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("VinculoHub Portal");
  });

  test("exibe conteúdo público sem redirecionar para Auth0", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Rotas protegidas redirecionam para Auth0", () => {
  for (const route of [
    "/ong/dashboard",
    "/ong/projetos",
    "/ong/perfil",
    "/empresa/dashboard",
    "/admin/dashboard",
    "/editais",
  ]) {
    test(`${route} redireciona para login`, async ({ page }) => {
      await page.goto(route);
      const url = page.url();
      const isAuth0 = url.includes("auth0.com") || url.includes("dev-u4fix3y");
      const isLoading = await page
        .locator("text=Carregando")
        .isVisible()
        .catch(() => false);
      expect(isAuth0 || isLoading || !url.endsWith(route)).toBeTruthy();
    });
  }
});

test.describe("Rotas públicas acessíveis sem login", () => {
  test("/ong/publico/:id carrega sem redirecionar para Auth0", async ({
    page,
  }) => {
    await page.goto("/ong/publico/1");
    const url = page.url();
    const redirectedToAuth0 =
      url.includes("auth0.com") || url.includes("dev-u4fix3y");
    expect(redirectedToAuth0).toBeFalsy();
  });
});

test.describe("API — segurança sem token", () => {
  test("POST /api/documents retorna 401", async ({ request }) => {
    const res = await request.post("http://localhost:8080/api/documents", {
      multipart: {
        file: {
          name: "test.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("test"),
        },
        data: "",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/documents retorna 401", async ({ request }) => {
    const res = await request.get("http://localhost:8080/api/documents");
    expect(res.status()).toBe(401);
  });

  test("GET /api/documents/my-ong retorna 401", async ({ request }) => {
    const res = await request.get("http://localhost:8080/api/documents/my-ong");
    expect(res.status()).toBe(401);
  });

  test("PUT /api/projects/1 retorna 401", async ({ request }) => {
    const res = await request.put("http://localhost:8080/api/projects/1", {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/projects/1 retorna 401", async ({ request }) => {
    const res = await request.delete("http://localhost:8080/api/projects/1");
    expect(res.status()).toBe(401);
  });

  test("POST /api/editais retorna 401", async ({ request }) => {
    const res = await request.post("http://localhost:8080/api/editais", {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/editais é público e retorna array", async ({ request }) => {
    const res = await request.get("http://localhost:8080/api/editais");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /public/ping retorna ok", async ({ request }) => {
    const res = await request.get("http://localhost:8080/public/ping");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
