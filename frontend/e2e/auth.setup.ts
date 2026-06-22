import { test as setup } from "@playwright/test";
import { ALL_PERSONAS } from "./helpers/credentials";
import { loginViaUi } from "./helpers/auth";

// Faz login de cada persona uma única vez e persiste o storageState (localStorage
// com tokens Auth0). Os specs reutilizam esses estados, evitando relogar a cada teste.
for (const persona of ALL_PERSONAS) {
  setup(`authenticate ${persona.key}`, async ({ page }) => {
    await loginViaUi(page, persona);
    await page.context().storageState({ path: persona.storageState });
  });
}
