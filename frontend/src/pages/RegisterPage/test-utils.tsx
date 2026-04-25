import React from "react";
import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterPage from "./index";

export const loginWithRedirectMock = vi.fn();

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: loginWithRedirectMock,
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn(),
    user: null,
  }),
}));

vi.mock("../../hooks/useCnpj", () => ({
  useCnpj: () => ({ data: undefined, isFetching: false, error: undefined }),
}));

vi.mock("../../hooks/useZipCode", () => ({
  useZipCode: (zip: string) =>
    zip === "01310-100"
      ? {
          data: {
            street: "Avenida Paulista",
            complement: "1000",
            city: "São Paulo",
            state: "São Paulo",
            stateCode: "SP",
          },
          isFetching: false,
          error: undefined,
        }
      : { data: undefined, isFetching: false, error: undefined },
}));

export function renderWithProviders() {
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

export async function selectNpoAndProceed(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole("button", { name: /Cadastro como ONG/i }));
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

export async function fillCredentialsAndProceed(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(await screen.findByLabelText(/E-mail/i), "test@example.com");
  await user.type(screen.getByLabelText(/^Senha\s*\*?$/i), "Abcd1234");
  await user.type(screen.getByLabelText(/Confirmar senha/i), "Abcd1234");
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

export async function fillInstitutionStepAndProceedFlexible(
  user: ReturnType<typeof userEvent.setup>,
  opts: { cpf?: string; cnpj?: string } = { cpf: "529.982.247-25" }, // <- default fixes legacy calls
) {
  await user.type(
    await screen.findByLabelText(/Nome da Instituição/i),
    "Instituição Teste",
  );
  if (opts.cpf)
    await user.type(screen.getByLabelText(/CPF do Responsável/i), opts.cpf);
  if (opts.cnpj) await user.type(screen.getByLabelText(/CNPJ/i), opts.cnpj);
  await user.selectOptions(screen.getByLabelText(/Tamanho/i), "small");
  await user.click(screen.getByRole("button", { name: /Ambiental/i }));
  await user.type(screen.getByLabelText(/Resumo Institucional/i), "Resumo.");
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

export async function fillContactStepAndProceed(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(await screen.findByLabelText(/CEP/i), "01310-100");
  await user.type(screen.getByLabelText(/Número/i), "123");
  await user.type(screen.getByLabelText(/Telefone/i), "(11) 91234-5678");
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}
