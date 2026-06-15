import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboard } from "./index";

vi.mock("../../announcement/CreateAnnouncementModal", () => ({
  CreateNoticeModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="create-notice-modal">
        <p>Cadastrar Novo Edital</p>
        <button onClick={onClose}>Fechar modal</button>
      </div>
    ) : null,
}));

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAllNposMock: vi.fn(),
  fetchAllCompaniesMock: vi.fn(),
  downloadCsvMock: vi.fn(),
  navigateMock: vi.fn(),
  fetchAdminNpoReportsMock: vi.fn(),
  updateAdminNpoReportStatusMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
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

vi.mock("../../api/admin", () => ({
  fetchAllNpos: mocks.fetchAllNposMock,
  fetchAllCompanies: mocks.fetchAllCompaniesMock,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}));

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock("../../utils/exportCsv", () => ({
  downloadCsv: mocks.downloadCsvMock,
}));
const reportFixture = {
  id: 1,
  npo: { id: 10, name: "ONG Reportada" },
  reporterCompany: {
    id: 20,
    name: "Empresa Denunciante",
    cnpj: "12345678000199",
  },
  reporterUser: {
    id: 30,
    name: "Pessoa Empresa",
    email: "empresa@example.com",
  },
  reason: "Documentos inconsistentes apresentados no perfil.",
  status: "OPEN",
  createdAt: "2026-05-29T12:00:00",
};

function reportsPage(content = [reportFixture]) {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    number: 0,
    size: 5,
  };
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAllNposMock.mockResolvedValue([]);
    mocks.fetchAllCompaniesMock.mockResolvedValue([]);
    mocks.updateAdminNpoReportStatusMock.mockResolvedValue({
      id: 1,
      npo: { id: 10, name: "ONG Reportada" },
      reporterCompany: {
        id: 20,
        name: "Empresa Denunciante",
        cnpj: "12345678000199",
      },
      reporterUser: {
        id: 30,
        name: "Pessoa Empresa",
        email: "empresa@example.com",
      },
      reason: "Documentos inconsistentes apresentados no perfil.",
      status: "RESOLVED",
      createdAt: "2026-05-29T12:00:00",
    });
    mocks.fetchAdminNpoReportsMock.mockResolvedValue(reportsPage());
  });

  it("renderiza o cabeçalho, as métricas e seus links", () => {
    render(<AdminDashboard />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Painel administrativo")).toBeInTheDocument();
    expect(
      screen.getByText("Gerencie ONGs, vínculos, denúncias e configurações da plataforma."),
    ).toBeInTheDocument();

    const metricLinks = screen.getAllByRole("link", { name: "Ver todos" });
    expect(metricLinks).toHaveLength(4);
    expect(metricLinks[0]).toHaveAttribute("href", "/admin/ongs");
    expect(metricLinks[1]).toHaveAttribute("href", "/editais");
    expect(metricLinks[2]).toHaveAttribute("href", "/admin/vinculos");
    expect(metricLinks[3]).toHaveAttribute("href", "/admin/notificacoes");
  });

  it("abre o modal de cadastro e navega para as páginas administrativas", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(screen.getByRole("button", { name: "Cadastrar Edital" }));
    expect(screen.getByTestId("create-notice-modal")).toBeInTheDocument();
    expect(screen.getByText("Cadastrar Novo Edital")).toBeInTheDocument();
  });

  it("renderiza as denúncias carregadas para o administrador", async () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Denúncias de ONGs")).toBeInTheDocument();
    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();
    expect(screen.getByText("Empresa Denunciante")).toBeInTheDocument();
    expect(screen.getByText("empresa@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Documentos inconsistentes apresentados no perfil."),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Alterar status da denúncia 1" })).toHaveValue(
      "OPEN",
    );
    expect(mocks.fetchAdminNpoReportsMock).toHaveBeenCalledWith("token", {
      companyName: undefined,
      npoName: undefined,
      page: 0,
      size: 5,
      status: "OPEN",
    });
  });

  it("atualiza o status de uma denúncia", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(screen.getByRole("button", { name: "Ver Denúncias" }));
    expect(mocks.navigateMock).toHaveBeenCalledWith("/admin/notificacoes");

    await user.click(screen.getByRole("button", { name: "Vínculos" }));
    expect(mocks.navigateMock).toHaveBeenCalledWith("/admin/vinculos");
    expect(mocks.updateAdminNpoReportStatusMock).toHaveBeenCalledWith(
      1,
      { status: "RESOLVED" },
      "token",
    );
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      'Status atualizado para "Resolvida" com sucesso.',
      "success",
    );
  });

  it("exporta os dados administrativos", async () => {
    const user = userEvent.setup();
    mocks.updateAdminNpoReportStatusMock.mockRejectedValue(new Error("Falha"));

    render(<AdminDashboard />);

    const select = await screen.findByRole("combobox", {
      name: "Alterar status da denúncia 1",
    });
    await user.selectOptions(select, "DISMISSED");

    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Não foi possível atualizar o status da denúncia.",
      "error",
    );
  });

  it("renderiza estado vazio quando não há denúncias", async () => {
    mocks.fetchAdminNpoReportsMock.mockResolvedValue(reportsPage([]));

    render(<AdminDashboard />);
    await user.click(screen.getByRole("button", { name: "Exportar Dados" }));

    await waitFor(() => expect(mocks.downloadCsvMock).toHaveBeenCalledTimes(2));

    expect(mocks.getAccessTokenSilentlyMock).toHaveBeenCalled();
    expect(mocks.fetchAllNposMock).toHaveBeenCalledWith("token");
    expect(mocks.fetchAllCompaniesMock).toHaveBeenCalledWith("token");
    expect(mocks.downloadCsvMock).toHaveBeenCalledWith(
      expect.stringMatching(/^ongs_\d{4}-\d{2}-\d{2}\.csv$/),
      [],
      expect.objectContaining({ name: "Nome", createdAt: "Data de Cadastro" }),
    );
    expect(mocks.downloadCsvMock).toHaveBeenCalledWith(
      expect.stringMatching(/^empresas_\d{4}-\d{2}-\d{2}\.csv$/),
      [],
      expect.objectContaining({ legalName: "Razão Social", createdAt: "Data de Cadastro" }),
    );
  });
});
