import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthRoleRedirect } from "./AuthRoleRedirect";

const mocks = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  navigateMock: vi.fn(),
  apiGetMock: vi.fn(),
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

vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
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
    get: mocks.apiGetMock,
    post: mocks.apiPostMock,
  },
}));

describe("AuthRoleRedirect payload", () => {
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
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Instituto Teste LTDA",
          cpf: "529.982.247-25",
          porteOng: "pequena",
          resumoInstitucional: "ONG focada em educação.",
          esg: ["ambiental", "social"],
          zipCode: "01310-100",
          street: "Av. Paulista",
          streetNumber: "1000",
          complement: "Sala 10",
          city: "São Paulo",
          state: "SP",
          stateCode: "SP",
          phone: "(11) 99999-9999",
          nomeProjeto: "Projeto Escola",
          tipoProjeto: "governamental",
          descricaoProjeto: "Projeto voltado para educação básica.",
          metaCaptacao: "10000",
          odsProjeto: ["4", "10"],
        },
      }),
    );
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.apiGetMock.mockResolvedValue({
      data: {
        registrationCompleted: true,
        userType: "npo",
        npoId: 1,
        companyId: null,
      },
    });
    mocks.apiPostMock.mockImplementation(async (_url, payload) => {
      console.log(JSON.stringify(payload, null, 2));
      return { data: {} };
    });
  });

  it("prints the outgoing NPO payload with the first project", async () => {
    render(
      <MemoryRouter initialEntries={["/cadastro"]}>
        <AuthRoleRedirect />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mocks.apiPostMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = mocks.apiPostMock.mock.calls[0];

    expect(payload).toMatchObject({
      name: "Instituto Teste",
      email: "teste@exemplo.com",
      cpf: "529.982.247-25",
      cnpj: "12.345.678/0001-90",
      npoSize: "pequena",
      description: "ONG focada em educação.",
      phone: "(11) 99999-9999",
      environmental: true,
      social: true,
      governance: false,
      address: {
        state: "SP",
        stateCode: "SP",
        city: "São Paulo",
        street: "Av. Paulista",
        number: "1000",
        complement: "Sala 10",
        zipCode: "01310-100",
      },
      firstProject: {
        name: "Projeto Escola",
        description: "Projeto voltado para educação básica.",
        capital: 10000,
        ods: ["4", "10"],
      },
    });
  });
});
