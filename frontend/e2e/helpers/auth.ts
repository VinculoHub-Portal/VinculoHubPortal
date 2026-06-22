import { expect, type Page } from "@playwright/test";
import type { Persona } from "./credentials";

/**
 * Executa o fluxo de login completo via Auth0 universal login (headless).
 *
 * Passos reais da UI:
 *  1. Landing → botão "Entrar" → abre modal de aviso.
 *  2. Modal "Continuar" → `loginWithRedirect` → redireciona para Auth0.
 *  3. Formulário Auth0 (#username/#password) → submit "Continuar".
 *  4. Auth0 redireciona de volta para a origem; AuthRoleRedirect leva ao dashboard.
 */
export async function loginViaUi(page: Page, persona: Persona): Promise<void> {
  await page.goto("/");

  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.waitForURL(/auth0\.com/, { timeout: 30000 });
  await page.fill("#username", persona.email);
  await page.fill("#password", persona.password);
  await page.locator('button[name="action"][type="submit"]').click();

  // Volta para a aplicação e o AuthRoleRedirect resolve o dashboard pelo papel.
  await page.waitForURL((url) => url.host.includes("localhost") || url.host === "", {
    timeout: 30000,
  });
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(persona.dashboard)}`), {
    timeout: 30000,
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
