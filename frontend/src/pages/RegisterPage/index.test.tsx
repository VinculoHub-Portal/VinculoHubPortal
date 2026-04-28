import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./index";
import { formatCurrencyValue } from "../../utils/formatCurrency";

const loginWithRedirectMock = vi.fn();
const checkCpfAvailableMock = vi.fn();
const checkCnpjAvailableMock = vi.fn();
const showToastMock = vi.fn();

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

vi.mock("../../api/documentCheck", () => ({
  checkCpfAvailable: (...args: unknown[]) => checkCpfAvailableMock(...args),
  checkCnpjAvailable: (...args: unknown[]) => checkCnpjAvailableMock(...args),
}));
vi.mock("../../hooks/useZipCode", () => ({
  useZipCode: () => ({ data: undefined, isFetching: false, error: undefined }),
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/cadastro"]}>
      <RegisterPage />
    </MemoryRouter>,
  );
}

async function advanceToProjectStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Cadastro como ONG/i }));
  await user.click(screen.getByRole("button", { name: /Próximo/i }));

  await user.type(await screen.findByLabelText(/Nome da Instituição/i), "Instituto Teste");
  await user.type(screen.getByLabelText(/CPF do Responsável/i), "529.982.247-25");
  await user.selectOptions(screen.getByLabelText(/Porte da ONG/i), "pequena");
  await user.click(screen.getByRole("button", { name: /Ambiental/i }));
  await user.click(screen.getByRole("button", { name: /Próximo/i }));

  await user.type(await screen.findByLabelText(/CEP/i), "01310-100");
  await user.type(screen.getByLabelText(/Número/i), "123");
  await user.click(screen.getByRole("button", { name: /Próximo/i }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    checkCpfAvailableMock.mockResolvedValue(true);
    checkCnpjAvailableMock.mockResolvedValue(true);
  });

  it("mostra o passo do primeiro projeto antes de finalizar o cadastro da ONG", async () => {
    const user = userEvent.setup();
    renderPage();

    await advanceToProjectStep(user);

    expect(await screen.findByLabelText(/Nome do projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição do projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo do projeto/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Meta de captação/i)).not.toBeInTheDocument();
  });

  it("oculta a meta de captação quando o projeto é social", async () => {
    const user = userEvent.setup();
    renderPage();

    await advanceToProjectStep(user);

    await user.type(await screen.findByLabelText(/Nome do projeto/i), "Projeto Escola");
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    );
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social");
    await user.click(screen.getByRole("button", { name: /ODS 1 - Erradicação da Pobreza/i }));
    expect(screen.queryByLabelText(/Meta de captação/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));
    expect(
      await screen.findByText(/Você será redirecionado para concluir o acesso/i),
    ).toBeInTheDocument();
  });

  it("exibe a meta de captação quando o projeto é governamental", async () => {
    const user = userEvent.setup();
    renderPage();

    await advanceToProjectStep(user);

    await user.type(await screen.findByLabelText(/Nome do projeto/i), "Projeto Escola");
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    );
    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    );
    expect(screen.getByLabelText(/Meta de captação/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Meta de captação/i), "10000");
    expect(screen.getByLabelText(/Meta de captação/i)).toHaveValue(
      formatCurrencyValue("10000"),
    );
    await user.click(screen.getByRole("button", { name: /ODS 1 - Erradicação da Pobreza/i }));
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));
    expect(
      await screen.findByText(/Você será redirecionado para concluir o acesso/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(sessionStorage.getItem("vinculohub:npo-signup-draft")).toContain(
      '"metaCaptacao":"10000"',
    );
  });

  it("mostra loading no modal enquanto conclui o cadastro da ONG", async () => {
    const user = userEvent.setup();
    let resolveLogin: (() => void) | null = null;

    loginWithRedirectMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );

    renderPage();
    await advanceToProjectStep(user);

    await user.type(await screen.findByLabelText(/Nome do projeto/i), "Projeto Escola");
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    );
    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    );
    await user.type(screen.getByLabelText(/Meta de captação/i), "10000");
    await user.click(screen.getByRole("button", { name: /ODS 1 - Erradicação da Pobreza/i }));
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(
      await screen.findByRole("button", { name: /Redirecionando.../i }),
    ).toBeDisabled();

    (resolveLogin as (() => void) | null)?.();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Redirecionando.../i }),
      ).not.toBeInTheDocument();
    });
  });

  it("não envia tipoProjeto para o Auth0 e mantém o fluxo no draft", async () => {
    const user = userEvent.setup();
    let resolveLogin: (() => void) | null = null;

    loginWithRedirectMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );

    renderPage();
    await advanceToProjectStep(user);

    await user.type(await screen.findByLabelText(/Nome do projeto/i), "Projeto Escola");
    await user.type(
      screen.getByLabelText(/Descrição do projeto/i),
      "Projeto voltado para educação básica.",
    );
    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    );
    await user.type(screen.getByLabelText(/Meta de captação/i), "10000");
    await user.click(screen.getByRole("button", { name: /ODS 1 - Erradicação da Pobreza/i }));
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(loginWithRedirectMock).toHaveBeenCalledTimes(1);
    expect(loginWithRedirectMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        appState: { returnTo: "/ong/dashboard" },
        authorizationParams: expect.objectContaining({
          projectType: "governamental",
          role: "NPO",
          screen_hint: "signup",
          ui_locales: "pt-BR",
        }),
      }),
    );
    expect(sessionStorage.getItem("vinculohub:npo-signup-draft")).toContain(
      '"tipoProjeto":"governamental"',
    );

    resolveLogin?.();
  });
});
