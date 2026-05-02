import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthRoleRedirect } from "./AuthRoleRedirect";

const mocks = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  navigateMock: vi.fn(),
  apiPostMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    isLoading: false,
    user: { email: "teste@exemplo.com" },
  }),
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
  };
});

vi.mock("../../services/api", () => ({
  api: {
    get: vi.fn(),
    post: mocks.apiPostMock,
  },
}));

describe("AuthRoleRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem("auth0-login-completed", "true");
    sessionStorage.setItem(
      "vinculohub:npo-signup-draft",
      JSON.stringify({
        formData: {
          nomeInstituicao: "Instituto Teste",
          email: "teste@exemplo.com",
          senha: "Abcd1234",
          confirmarSenha: "Abcd1234",
          cnpj: "",
          razaoSocial: "",
          cpf: "529.982.247-25",
          porteOng: "pequena",
          resumoInstitucional: "",
          esg: ["ambiental"],
          zipCode: "",
          street: "",
          streetNumber: "",
          complement: "",
          city: "",
          state: "",
          stateCode: "",
          phone: "",
          nomeProjeto: "Projeto Escola",
          tipoProjeto: "governamental",
          descricaoProjeto: "Projeto voltado para educação básica.",
          metaCaptacao: "10000",
          odsProjeto: ["1"],
        },
      }),
    );
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.apiPostMock.mockRejectedValue(
      Object.assign(new Error("Service unavailable"), {
        isAxiosError: true,
        response: { status: 503 },
      }),
    );
  });

  it("mostra serviço indisponível quando o envio falha por erro 5xx", async () => {
    render(
      <MemoryRouter initialEntries={["/cadastro"]}>
        <AuthRoleRedirect />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mocks.showToastMock).toHaveBeenCalledWith("Serviço indisponível");
    });
  });

  it("envia capital nulo quando o projeto é social", async () => {
    mocks.apiPostMock.mockResolvedValueOnce({ data: {} });
    sessionStorage.setItem(
      "vinculohub:npo-signup-draft",
      JSON.stringify({
        formData: {
          nomeInstituicao: "Instituto Teste",
          email: "teste@exemplo.com",
          senha: "Abcd1234",
          confirmarSenha: "Abcd1234",
          cnpj: "",
          razaoSocial: "",
          cpf: "529.982.247-25",
          porteOng: "pequena",
          resumoInstitucional: "",
          esg: ["ambiental"],
          zipCode: "",
          street: "",
          streetNumber: "",
          complement: "",
          city: "",
          state: "",
          stateCode: "",
          phone: "",
          nomeProjeto: "Projeto Escola",
          tipoProjeto: "social",
          descricaoProjeto: "Projeto voltado para educação básica.",
          metaCaptacao: "10000",
          odsProjeto: ["1"],
        },
      }),
    );

    render(
      <MemoryRouter initialEntries={["/cadastro"]}>
        <AuthRoleRedirect />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mocks.apiPostMock).toHaveBeenCalled();
    });

    const [, payload] = mocks.apiPostMock.mock.calls[0];
    expect(payload.firstProject.capital).toBeNull();
    expect(payload.firstProject.ods).toEqual(["1"]);
  });
});
