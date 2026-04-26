import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./index";

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

async function reachNpoFinalStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Cadastro como ONG/i }));
  await user.click(screen.getByRole("button", { name: /Próximo/i }));

  await user.type(await screen.findByLabelText(/Nome da Instituição/i), "Instituto Teste");
  await user.type(screen.getByLabelText(/CPF do Responsável/i), "529.982.247-25");
  await user.selectOptions(screen.getByLabelText(/Porte da ONG/i), "pequena");
  await user.click(screen.getByRole("button", { name: /Ambiental/i }));
  await user.click(screen.getByRole("button", { name: /Próximo/i }));

  await user.type(await screen.findByLabelText(/CEP/i), "01310-100");
  await user.type(screen.getByLabelText(/Número/i), "123");
  await user.click(screen.getByRole("button", { name: /Finalizar/i }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    checkCpfAvailableMock.mockResolvedValue(true);
    checkCnpjAvailableMock.mockResolvedValue(true);
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
    await reachNpoFinalStep(user);

    await user.click(screen.getByRole("button", { name: /Finalizar/i }));
    await user.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(
      await screen.findByRole("button", { name: /Redirecionando.../i }),
    ).toBeDisabled();

    resolveLogin?.();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Redirecionando.../i }),
      ).not.toBeInTheDocument();
    });
  });
});
