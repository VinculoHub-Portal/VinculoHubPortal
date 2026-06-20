import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NpoReportResponse } from "../../api/npoReports";
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
  fetchAllVinculosMock: vi.fn(),
  fetchAdminMetricsMock: vi.fn(),
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
  fetchAllVinculos: mocks.fetchAllVinculosMock,
  fetchAdminMetrics: mocks.fetchAdminMetricsMock,
}));

vi.mock("../../api/npoReports", () => ({
  fetchAdminNpoReports: mocks.fetchAdminNpoReportsMock,
  updateAdminNpoReportStatus: mocks.updateAdminNpoReportStatusMock,
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

const metricsFixture = {
  totalNpos: 42,
  publishedEditais: 7,
  activeVinculos: 11,
  pendingNotifications: 3,
};

const npoExportFixture = [
  {
    id: 1,
    name: "ONG Alfa",
    cnpj: "12345678000199",
    cpf: null,
    phone: "1133334444",
    npoSize: "medium" as const,
    environmental: true,
    social: false,
    governance: true,
    city: "São Paulo",
    state: "SP",
    zipCode: "01000-000",
    createdAt: "2026-06-01T10:00:00",
  },
];

const companyExportFixture = [
  {
    id: 2,
    legalName: "Empresa Beta LTDA",
    socialName: "Empresa Beta",
    cnpj: "99887766000155",
    phone: "1144445555",
    email: "contato@empresa.beta",
    city: "Campinas",
    state: "SP",
    zipCode: "13000-000",
    createdAt: "2026-06-01T10:00:00",
  },
];

const vinculosExportFixture = [
  {
    companyName: "Empresa Beta",
    npoName: "ONG Alfa",
    projectTitle: "Projeto Verde",
    status: "negotiation" as const,
  },
];

const reportFixture: NpoReportResponse = {
  id: 1,
  npo: {
    id: 10,
    name: "ONG Reportada",
    email: "contato@ong.org",
  },
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
  status: "OPEN" as const,
  createdAt: "2026-05-29T12:00:00",
};

function reportsPage(
  content = [reportFixture],
  overrides: Partial<{
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> = {},
) {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? 2 : 0,
    number: 0,
    size: 5,
    ...overrides,
  };
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAdminMetricsMock.mockResolvedValue(metricsFixture);
    mocks.fetchAllNposMock.mockResolvedValue([]);
    mocks.fetchAllCompaniesMock.mockResolvedValue([]);
    mocks.fetchAllVinculosMock.mockResolvedValue([]);
    mocks.fetchAdminNpoReportsMock.mockResolvedValue(reportsPage());
    mocks.updateAdminNpoReportStatusMock.mockResolvedValue({
      ...reportFixture,
      status: "RESOLVED",
    });
  });

  it("renderiza o cabeçalho, carrega métricas da API e mantém os links do dashboard", async () => {
    render(<AdminDashboard />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Painel administrativo")).toBeInTheDocument();
    expect(
      screen.getByText("Gerencie ONGs, vínculos, denúncias e configurações da plataforma."),
    ).toBeInTheDocument();

    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(mocks.fetchAdminMetricsMock).toHaveBeenCalledWith("token");

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

    await user.click(screen.getByRole("button", { name: "Ver Denúncias" }));
    expect(mocks.navigateMock).toHaveBeenCalledWith("/admin/notificacoes");

    await user.click(screen.getByRole("button", { name: "Vínculos" }));
    expect(mocks.navigateMock).toHaveBeenCalledWith("/admin/vinculos");
  });

  it("exporta ONGs, empresas e vínculos com os mapeamentos corretos", async () => {
    const user = userEvent.setup();

    mocks.fetchAllNposMock.mockResolvedValue(npoExportFixture);
    mocks.fetchAllCompaniesMock.mockResolvedValue(companyExportFixture);
    mocks.fetchAllVinculosMock.mockResolvedValue(vinculosExportFixture);

    render(<AdminDashboard />);
    await user.click(screen.getByRole("button", { name: "Exportar Dados" }));

    await waitFor(() => expect(mocks.downloadCsvMock).toHaveBeenCalledTimes(3));

    expect(mocks.fetchAllNposMock).toHaveBeenCalledWith("token");
    expect(mocks.fetchAllCompaniesMock).toHaveBeenCalledWith("token");
    expect(mocks.fetchAllVinculosMock).toHaveBeenCalledWith("token");

    expect(mocks.downloadCsvMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/^ongs_\d{4}-\d{2}-\d{2}\.csv$/),
      [
        expect.objectContaining({
          name: "ONG Alfa",
          npoSize: "Médio",
        }),
      ],
      expect.not.objectContaining({ cpf: "CPF" }),
    );
    expect(mocks.downloadCsvMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/^empresas_\d{4}-\d{2}-\d{2}\.csv$/),
      companyExportFixture,
      expect.objectContaining({
        legalName: "Razão Social",
        createdAt: "Data de Cadastro",
      }),
    );
    expect(mocks.downloadCsvMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/^vinculos_\d{4}-\d{2}-\d{2}\.csv$/),
      [
        expect.objectContaining({
          companyName: "Empresa Beta",
          status: "Negociação",
        }),
      ],
      expect.objectContaining({
        companyName: "Empresa",
        status: "Status",
      }),
    );
  });

  it("renderiza as denúncias carregadas e remove a linha ao resolver uma denúncia aberta", async () => {
    const user = userEvent.setup();

    mocks.fetchAdminNpoReportsMock.mockResolvedValue(
      reportsPage([reportFixture], { totalElements: 1, totalPages: 1 }),
    );

    render(<AdminDashboard />);

    expect(screen.getByText("Denúncias de ONGs")).toBeInTheDocument();
    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();
    expect(screen.getByText("1 pendentes")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();

    const select = screen.getByRole("combobox", {
      name: "Alterar status da denúncia 1",
    });

    await user.selectOptions(select, "RESOLVED");

    await waitFor(() =>
      expect(mocks.updateAdminNpoReportStatusMock).toHaveBeenCalledWith(
        1,
        { status: "RESOLVED" },
        "token",
      ),
    );
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      'Status atualizado para "Resolvida" com sucesso.',
      "success",
    );
    expect(screen.getByText("0 pendentes")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma denúncia pendente.")).toBeInTheDocument();
    expect(screen.queryByText("ONG Reportada")).not.toBeInTheDocument();
  });

  it("mantém o contador de pendentes ao trocar para outra aba de status", async () => {
    const user = userEvent.setup();

    mocks.fetchAdminNpoReportsMock
      .mockResolvedValueOnce(
        reportsPage([reportFixture], { totalElements: 3, totalPages: 1 }),
      )
      .mockResolvedValueOnce(
        reportsPage(
          [
            {
              ...reportFixture,
              id: 2,
              status: "RESOLVED",
              reason: "Denúncia já analisada.",
            },
          ],
          { totalElements: 1, totalPages: 1 },
        ),
      );

    render(<AdminDashboard />);

    expect(await screen.findByText("3 pendentes")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Resolvida" }));

    await waitFor(() =>
      expect(mocks.fetchAdminNpoReportsMock).toHaveBeenLastCalledWith("token", {
        npoName: undefined,
        companyName: undefined,
        status: "RESOLVED",
        page: 0,
        size: 5,
      }),
    );
    expect(screen.getByText("3 pendentes")).toBeInTheDocument();
    expect(await screen.findByText("Denúncia já analisada.")).toBeInTheDocument();
  });

  it("pagina para o próximo lote de denúncias", async () => {
    const user = userEvent.setup();

    render(<AdminDashboard />);
    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima →" }));

    await waitFor(() =>
      expect(mocks.fetchAdminNpoReportsMock).toHaveBeenLastCalledWith("token", {
        npoName: undefined,
        companyName: undefined,
        status: "OPEN",
        page: 1,
        size: 5,
      }),
    );
  });

  it("renderiza estado vazio quando não há denúncias", async () => {
    mocks.fetchAdminNpoReportsMock.mockResolvedValue(reportsPage([], { totalPages: 0 }));

    render(<AdminDashboard />);

    expect(await screen.findByText("Nenhuma denúncia pendente.")).toBeInTheDocument();
  });

  it("renderiza erro quando não consegue carregar denúncias", async () => {
    mocks.fetchAdminNpoReportsMock.mockRejectedValue(new Error("Falha"));

    render(<AdminDashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar as denúncias.",
    );
  });
});
