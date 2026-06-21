import { render, screen } from "@testing-library/react";
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
  fetchAdminNpoReportsMock: vi.fn(),
  updateAdminNpoReportStatusMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/npoReports", () => ({
  fetchAdminNpoReports: mocks.fetchAdminNpoReportsMock,
  updateAdminNpoReportStatus: mocks.updateAdminNpoReportStatusMock,
}));

vi.mock("../../api/admin", () => ({
  fetchAdminMetrics: vi.fn().mockResolvedValue({
    totalNpos: 87,
    publishedEditais: 24,
    activeVinculos: 156,
    pendingNotifications: 5,
  }),
  fetchAllNpos: vi.fn().mockResolvedValue([]),
  fetchAllCompanies: vi.fn().mockResolvedValue([]),
  fetchAllVinculos: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}));

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
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

  it("renderiza o cabeçalho e o título da página", () => {
    render(<AdminDashboard />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Painel administrativo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gerencie usuários, organizações e configurações da plataforma.",
      ),
    ).toBeInTheDocument();
  });

  it("renderiza as métricas principais do dashboard", async () => {
    render(<AdminDashboard />);

    expect(
      await screen.findByRole("article", { name: "Total de ONGs: 87" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Editais Publicados: 24" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Vínculos Ativos: 156" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Notificações Pendentes: 5" }),
    ).toBeInTheDocument();
  });

  it("renderiza as ações do topo", () => {
    render(<AdminDashboard />);

    expect(
      screen.getByRole("button", { name: "Cadastrar Edital" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Exportar Dados" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver Denúncias" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mediações" }),
    ).toBeInTheDocument();
  });

  it("abre o modal de cadastro de edital ao clicar em 'Cadastrar Edital'", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    expect(screen.queryByTestId("create-notice-modal")).not.toBeInTheDocument();

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

    const select = await screen.findByRole("combobox", {
      name: "Alterar status da denúncia 1",
    });
    await user.selectOptions(select, "RESOLVED");

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

  it("mostra erro quando a atualização de status falha", async () => {
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

    expect(await screen.findByText("Nenhuma denúncia pendente.")).toBeInTheDocument();
  });

  it("renderiza erro quando não consegue carregar denúncias", async () => {
    mocks.fetchAdminNpoReportsMock.mockRejectedValue(new Error("Falha"));

    render(<AdminDashboard />);

    expect(
      await screen.findByText("Não foi possível carregar as denúncias."),
    ).toBeInTheDocument();
  });
});
