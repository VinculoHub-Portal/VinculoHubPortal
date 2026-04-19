import React from "react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterPage } from "./index";

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn(),
    user: null,
  }),
}));

vi.mock("../../hooks/useCnpj", () => ({
  useCnpj: (_cnpj: string) => ({
    data: undefined,
    isFetching: false,
    error: undefined,
  }),
}));

vi.mock("../../hooks/useZipCode", () => ({
  useZipCode: (_zip: string) => ({
    data: undefined,
    isFetching: false,
    error: undefined,
  }),
}));

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/cadastro"]}>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function selectNpoAndProceed(user: ReturnType<typeof userEvent.setup>) {
  const npoButton = screen.getByRole("button", { name: /Cadastro como ONG/i });
  await user.click(npoButton);
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

async function fillCredentialsAndProceed(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(await screen.findByLabelText(/E-mail/i), "test@example.com");
  await user.type(screen.getByLabelText(/^Senha\s*\*?$/i), "Abcd1234");
  await user.type(screen.getByLabelText(/Confirmar senha/i), "Abcd1234");
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

async function fillInstitutionStepAndProceed(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(
    await screen.findByLabelText(/Nome da Instituição/i),
    "Instituição Teste",
  );
  await user.type(
    screen.getByLabelText(/CPF do Responsável/i),
    "529.982.247-25",
  );
  await user.selectOptions(
    screen.getByLabelText(/Tamanho/i) as HTMLSelectElement,
    "small",
  );
  // ESG is optional, but we can select one for completeness
  await user.click(screen.getByRole("button", { name: /Ambiental/i }));
  await user.type(screen.getByLabelText(/Resumo Institucional/i), "Resumo.");
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

async function fillContactStepAndProceed(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(await screen.findByLabelText(/CEP/i), "01310-100");
  // Wait for ZIP lookup to complete and fields to be disabled
  await new Promise((resolve) => setTimeout(resolve, 500));

  await user.type(screen.getByLabelText(/Número/i), "123");

  await user.type(screen.getByLabelText(/Telefone/i), "(11) 91234-5678");

  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

describe("RegisterPage — per-step tests (NPO flow)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("Step 1: allows selecting NPO and advances to step 2", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await selectNpoAndProceed(user);

    expect(await screen.findByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha\s*\*?$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar senha/i)).toBeInTheDocument();
  });

  it("Step 2: validates credentials and advances to step 3", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);

    expect(
      await screen.findByLabelText(/Nome da Instituição/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF do Responsável/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tamanho/i)).toBeInTheDocument();
  });

  it("Step 3: accepts institution data and advances to step 4 (contact)", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    await fillInstitutionStepAndProceed(user);

    expect(await screen.findByLabelText(/CEP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número/i)).toBeInTheDocument();
  });

  it("Step 4: advances to step 5 (project form)", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    await fillInstitutionStepAndProceed(user);
    await fillContactStepAndProceed(user);

    expect(
      await screen.findByLabelText(/Nome do Projeto/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição do Projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meta de captação/i)).toBeInTheDocument();
  });

  it("Step 5: finalizing opens the Auth0 redirect modal", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    await fillInstitutionStepAndProceed(user);
    await fillContactStepAndProceed(user);

    await user.type(
      await screen.findByLabelText(/Nome do Projeto/i),
      "Projeto Bom",
    );
    await user.type(
      screen.getByLabelText(/Descrição do Projeto/i),
      "Descrição exemplo",
    );
    await user.type(screen.getByLabelText(/Meta de captação/i), "10000");

    // Select at least one ODS
    const odsField = screen.getByLabelText(/ODS/i);
    await user.click(odsField);
    await user.click(screen.getByText(/ODS 1 - Erradicação da Pobreza/i));

    expect(screen.getByDisplayValue(/Projeto Bom/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Descrição exemplo/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Finalizar/i }));

    expect(
      await screen.findByText(
        /Você será redirecionado para concluir o acesso/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continuar/i }),
    ).toBeInTheDocument();
  });
});
