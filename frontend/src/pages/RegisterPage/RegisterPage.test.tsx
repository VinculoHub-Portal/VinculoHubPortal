import React from "react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterPage from "./index";
import {
  selectNpoAndProceed,
  fillCredentialsAndProceed,
  fillInstitutionStepAndProceedFlexible,
  fillContactStepAndProceed,
} from "./test-utils";

// Mock Auth0 hook so it doesn't try to open real login
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

// Mock hooks so lookups don't call network
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

// Helpers moved to test-utils.tsx

describe("RegisterPage — legacy suite aligned to current Steps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("Step 1 -> 2", async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await selectNpoAndProceed(user);
    expect(await screen.findByLabelText(/E-mail/i)).toBeInTheDocument();
  });

  it("Step 2 -> 3", async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    expect(
      await screen.findByLabelText(/Nome da Instituição/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF do Responsável/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CNPJ/i)).toBeInTheDocument(); // label, not placeholder
  });

  it("Step 3 -> 4", async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    await fillInstitutionStepAndProceedFlexible(user);
    expect(await screen.findByLabelText(/CEP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número/i)).toBeInTheDocument();
  });

  it("Step 4 -> 5", async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    await fillInstitutionStepAndProceedFlexible(user);
    await fillContactStepAndProceed(user);
    expect(
      await screen.findByLabelText(/Nome do Projeto/i),
    ).toBeInTheDocument();
  });

  it("Step 5 fields are editable", async () => {
    const user = userEvent.setup();
    renderWithProviders();
    await selectNpoAndProceed(user);
    await fillCredentialsAndProceed(user);
    await fillInstitutionStepAndProceedFlexible(user);
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

    expect(screen.getByDisplayValue(/Projeto Bom/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Descrição exemplo/i)).toBeInTheDocument();
  });
});
