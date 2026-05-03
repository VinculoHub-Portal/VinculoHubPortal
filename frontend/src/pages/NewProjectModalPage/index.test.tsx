import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { NewProjectModalPage } from "./index";
import { formatCurrencyValue } from "../../utils/formatCurrency";

const mocks = vi.hoisted(() => ({
  apiPostMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  loginWithRedirectMock: vi.fn(),
  logoutMock: vi.fn(),
  showToastMock: vi.fn(),
}));

const odsCatalogMock = [
  {
    id: 1,
    name: "ODS 1 - Erradicação da Pobreza",
    description: "Erradicar a pobreza em todas as formas, em todos os lugares.",
  },
  {
    id: 4,
    name: "ODS 4 - Educação de Qualidade",
    description: "Assegurar educação inclusiva e equitativa de qualidade.",
  },
];

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    loginWithRedirect: mocks.loginWithRedirectMock,
    logout: mocks.logoutMock,
    user: { email: "npo@teste.com" },
  }),
}));

vi.mock("../../services/api", () => ({
  api: {
    post: mocks.apiPostMock,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock("../../hooks/useOdsCatalog", () => ({
  useOdsCatalog: () => ({
    data: odsCatalogMock,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <NewProjectModalPage />
    </MemoryRouter>,
  );
}

async function fillBaseProject(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nome do projeto/i), "Projeto Escola");
  await user.type(
    screen.getByLabelText(/Descrição do projeto/i),
    "Projeto voltado para educação básica.",
  );
}

describe("NewProjectModalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("access-token");
    mocks.apiPostMock.mockResolvedValue({
      data: {
        id: 10,
        name: "Projeto Escola",
        description: "Projeto voltado para educação básica.",
        type: "SOCIAL_INVESTMENT_LAW",
        capital: null,
        npoId: 20,
      },
    });
  });

  it("valida ODS obrigatório antes de salvar", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillBaseProject(user);
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social");
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));

    expect(await screen.findByText(/Selecione ao menos um ODS/i)).toBeInTheDocument();
    expect(mocks.apiPostMock).not.toHaveBeenCalled();
  });

  it("salva projeto social com payload sem meta de captação", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillBaseProject(user);
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social");
    expect(screen.queryByLabelText(/Meta de captação/i)).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /ODS 1 - Erradicação da Pobreza/i }),
    );
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));

    await waitFor(() => {
      expect(mocks.apiPostMock).toHaveBeenCalledTimes(1);
    });

    expect(mocks.apiPostMock).toHaveBeenCalledWith(
      "/api/projects",
      {
        name: "Projeto Escola",
        description: "Projeto voltado para educação básica.",
        type: "SOCIAL_INVESTMENT_LAW",
        capital: null,
        ods: ["1"],
      },
      {
        headers: {
          Authorization: "Bearer access-token",
        },
      },
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("salva projeto governamental com payload de meta e ODS", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillBaseProject(user);
    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    );
    await user.type(screen.getByLabelText(/Meta de captação/i), "25000");
    expect(screen.getByLabelText(/Meta de captação/i)).toHaveValue(
      formatCurrencyValue("25000"),
    );
    await user.click(
      screen.getByRole("button", { name: /ODS 4 - Educação de Qualidade/i }),
    );
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));

    await waitFor(() => {
      expect(mocks.apiPostMock).toHaveBeenCalledTimes(1);
    });

    expect(mocks.apiPostMock).toHaveBeenCalledWith(
      "/api/projects",
      {
        name: "Projeto Escola",
        description: "Projeto voltado para educação básica.",
        type: "TAX_INCENTIVE_LAW",
        capital: 25000,
        ods: ["4"],
      },
      {
        headers: {
          Authorization: "Bearer access-token",
        },
      },
    );
  });

  it("limpa meta de captação ao trocar projeto governamental para social", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    );
    await user.type(screen.getByLabelText(/Meta de captação/i), "10000");
    expect(screen.getByLabelText(/Meta de captação/i)).toHaveValue(
      formatCurrencyValue("10000"),
    );

    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social");

    expect(screen.queryByLabelText(/Meta de captação/i)).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText(/Tipo do projeto/i),
      "governamental",
    );
    expect(screen.getByLabelText(/Meta de captação/i)).toHaveValue("");
  });

  it("mantém o modal aberto e exibe toast quando o salvamento falha", async () => {
    const user = userEvent.setup();
    mocks.apiPostMock.mockRejectedValueOnce(new Error("network"));
    renderPage();

    await fillBaseProject(user);
    await user.selectOptions(screen.getByLabelText(/Tipo do projeto/i), "social");
    await user.click(
      screen.getByRole("button", { name: /ODS 1 - Erradicação da Pobreza/i }),
    );
    await user.click(screen.getByRole("button", { name: /Finalizar/i }));

    await waitFor(() => {
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Não foi possível salvar o projeto. Tente novamente.",
      );
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
