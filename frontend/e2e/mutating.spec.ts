import { test, expect, type Page } from "@playwright/test";
import { PERSONAS } from "./helpers/credentials";

// =============================================================================
// SUÍTE DE FLUXOS MUTANTES (alteram o estado seedado do banco).
//
// ⚠️  Estes testes CRIAM dados (projetos, editais) e AVANÇAM vínculos. São
//     escritos para serem RESILIENTES a reexecuções (detectam estado já
//     existente), mas para uma validação limpa do "happy path" do zero, rode
//     com um seed fresco: `docker compose down -v && docker compose up -d --build`.
//
// Mantidos separados da suíte verde (empresa/ong/admin/auth) justamente por
// não serem idempotentes.
// =============================================================================

const uniqueSuffix = () => `${Date.now()}`;

// -----------------------------------------------------------------------------
// ONG — Criar projeto (E2E-ONG-04)
// -----------------------------------------------------------------------------
test.describe("Fluxo mutante: ONG cria projeto", { tag: "@mutating" }, () => {
  test.use({ storageState: PERSONAS.npoProjects.storageState });

  test("E2E-ONG-04 cria projeto e ele aparece na listagem", async ({ page }) => {
    const projectName = `Projeto E2E ${uniqueSuffix()}`;

    await page.goto("/ong/dashboard");
    await page.getByRole("button", { name: "Novo Projeto" }).click();

    const modal = page.getByRole("dialog");
    await expect(
      modal.getByRole("heading", { name: "Cadastrar Novo Projeto" }),
    ).toBeVisible();

    await modal.getByLabel("Nome do Projeto").fill(projectName);
    await modal
      .getByLabel("Descrição do Projeto")
      .fill(
        "Projeto criado automaticamente pelo teste E2E para validar o fluxo de cadastro de projetos da ONG.",
      );
    await modal
      .getByLabel("Tipo de Projeto")
      .selectOption({ label: "Investimento Social Privado" });
    // Seleciona o primeiro ODS disponível.
    await modal.locator('button[aria-pressed="false"]').first().click();

    await modal.getByRole("button", { name: "Cadastrar Projeto" }).click();

    // Sucesso: modal fecha e mensagem aparece.
    await expect(
      page.getByText("Projeto cadastrado com sucesso!"),
    ).toBeVisible({ timeout: 15000 });

    // E o projeto aparece na listagem completa.
    await page.goto("/ong/projetos");
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 15000 });
  });
});

// -----------------------------------------------------------------------------
// ADMIN — Cadastrar edital (E2E-ADM-11)
// -----------------------------------------------------------------------------
test.describe("Fluxo mutante: Admin cadastra edital", { tag: "@mutating" }, () => {
  test.use({ storageState: PERSONAS.admin.storageState });

  test("E2E-ADM-11 publica edital e ele aparece no mural", async ({ page }) => {
    const title = `Edital E2E ${uniqueSuffix()}`;
    // Prazo futuro (30 dias).
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const deadline = future.toISOString().slice(0, 10);

    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: "Cadastrar Edital" }).click();

    const modal = page.getByRole("dialog");
    await modal.locator("#title").fill(title);
    await modal
      .locator("#description")
      .fill(
        "Edital criado automaticamente pelo teste E2E para validar o fluxo de publicação no mural.",
      );
    await modal.locator("#deadline").fill(deadline);
    // Seleciona a primeira ODS real (índice 1; índice 0 é o placeholder).
    await modal.locator("#category").selectOption({ index: 1 });
    // Anexa um PDF de teste ao input de arquivo (escondido).
    await modal.locator('input[type="file"]').setInputFiles({
      name: "edital-e2e.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 teste e2e"),
    });

    await modal.getByRole("button", { name: "Publicar Edital" }).click();

    // Modal deve fechar (sucesso) e o edital aparecer no mural.
    await expect(modal).toBeHidden({ timeout: 15000 });
    await page.goto("/editais");
    await expect(page.getByText(title)).toBeVisible({ timeout: 15000 });
  });
});

// -----------------------------------------------------------------------------
// HANDSHAKE cross-persona (E2E-EMP-08, E2E-ONG-09, E2E-FLOW-01/02)
// Empresa (company.empty / "Horizonte") demonstra interesse em
// "Educacao para Todos" (ONG npo.projects) → ONG aceita → contato revelado →
// ambos efetivam → vínculo ativo.
// -----------------------------------------------------------------------------
test.describe.serial("Fluxo mutante: handshake empresa ↔ ONG", { tag: "@mutating" }, () => {
  const PROJECT_NAME = "Educacao para Todos";

  function ongCard(page: Page, partnerName: string) {
    return page
      .locator(".MuiCard-root")
      .filter({ has: page.getByRole("heading", { level: 2, name: PROJECT_NAME }) })
      .filter({ hasText: partnerName });
  }

  test("E2E-EMP-08/09 empresa (Empresa Horizonte) demonstra interesse", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: PERSONAS.companyEmpty.storageState,
    });
    const page = await context.newPage();
    try {
      // Fluxo de descoberta 100% pela UI (valida PR #320 / achado 11.1):
      // dashboard → vitrine "Ver perfil" → perfil público → card do projeto → /projeto/:id.
      await page.goto("/empresa/dashboard");
      await page
        .getByRole("button", { name: "Ver perfil de Instituto Projetos Vivos" })
        .first()
        .click();
      await expect(page).toHaveURL(/\/ong\/publico\/\d+/);
      await page.getByRole("link", { name: new RegExp(PROJECT_NAME) }).click();
      await expect(page).toHaveURL(/\/projeto\/\d+/);

      const interesseBtn = page.getByRole("button", {
        name: /Demonstrar Interesse|Interesse já enviado/,
      });
      await expect(interesseBtn).toBeVisible({ timeout: 15000 });

      const label = (await interesseBtn.textContent())?.trim() ?? "";
      if (label.includes("Demonstrar Interesse") && (await interesseBtn.isEnabled())) {
        await interesseBtn.click();
        const modal = page.getByRole("dialog", { name: "Demonstrar Interesse" });
        await modal.getByRole("button", { name: "Confirmar" }).click();
        await expect(
          page.getByText(/Interesse enviado com sucesso|Já existe vínculo/),
        ).toBeVisible({ timeout: 15000 });
      }
      // E2E-EMP-09: a persistência impede novo interesse (botão desabilitado).
      // Tolera o atraso read-after-write recarregando até o estado refletir
      // (logo após criar, `useExistingRelationship` pode demorar a enxergar o vínculo).
      await expect(async () => {
        await page.reload();
        await expect(
          page.getByRole("button", { name: "Interesse já enviado" }),
        ).toBeVisible({ timeout: 5000 });
      }).toPass({ timeout: 30000 });
    } finally {
      await context.close();
    }
  });

  test("E2E-ONG-09 / FLOW-02 ONG aceita e o contato é revelado", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: PERSONAS.npoProjects.storageState,
    });
    const page = await context.newPage();
    try {
      await page.goto("/meus-vinculos");
      const card = ongCard(page, "Horizonte");
      await expect(card).toBeVisible({ timeout: 15000 });

      const aceitar = card.getByRole("button", { name: "Aceitar Contato" });
      if ((await aceitar.count()) > 0) {
        await aceitar.click();
        await expect(
          page.getByText("Contato aceito com sucesso."),
        ).toBeVisible({ timeout: 15000 });
      }

      // Após aceite → negociação (ou já ativo): contato deve estar revelado.
      const cardAfter = ongCard(page, "Horizonte");
      await expect(
        cardAfter.getByText("Informações de Contato"),
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("E2E-FLOW-01 ambos efetivam → vínculo fica ativo", async ({
    browser,
  }) => {
    // A efetivação é sequencial (cada parte confirma na sua vez), então tentamos
    // cada lado em rodadas alternadas até o vínculo ficar ativo.
    // Retorna true se conseguiu clicar em "Efetivar Parceria" neste lado.
    async function tryConfirm(
      storageState: string,
      partnerName: string,
    ): Promise<boolean> {
      const context = await browser.newContext({ storageState });
      const page = await context.newPage();
      try {
        await page.goto("/meus-vinculos");
        // Aguarda os vínculos carregarem (React Query) antes de inspecionar.
        await page
          .getByText("Carregando seus vínculos...")
          .waitFor({ state: "hidden" })
          .catch(() => {});
        const card = page
          .locator(".MuiCard-root")
          .filter({
            has: page.getByRole("heading", { level: 2, name: PROJECT_NAME }),
          })
          .filter({ hasText: partnerName });
        await card
          .first()
          .waitFor({ state: "visible", timeout: 8000 })
          .catch(() => {});
        if ((await card.count()) === 0) return false;
        const efetivar = card.getByRole("button", { name: "Efetivar Parceria" });
        if ((await efetivar.count()) === 0) return false;

        await efetivar.first().click();
        const modal = page.getByRole("dialog");
        await modal.getByRole("button", { name: "Confirmar" }).click();
        // Tolerante: aguarda o modal fechar (sucesso) sem exigir o texto exato.
        await expect(modal).toBeHidden({ timeout: 15000 });
        return true;
      } finally {
        await context.close();
      }
    }

    // Até 4 rodadas alternando empresa/ONG até nenhum lado ter mais o que confirmar.
    for (let round = 0; round < 4; round += 1) {
      const companyConfirmed = await tryConfirm(
        PERSONAS.companyEmpty.storageState,
        "Instituto Projetos Vivos",
      );
      const ongConfirmed = await tryConfirm(
        PERSONAS.npoProjects.storageState,
        "Horizonte",
      );
      if (!companyConfirmed && !ongConfirmed) break;
    }

    // Verificação final: a ONG vê o vínculo do projeto como Ativo.
    const context = await browser.newContext({
      storageState: PERSONAS.npoProjects.storageState,
    });
    const page = await context.newPage();
    try {
      await page.goto("/meus-vinculos?filter=active");
      const card = ongCard(page, "Horizonte");
      await expect(card).toBeVisible({ timeout: 15000 });
      await expect(card.getByText("Ativo").first()).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
