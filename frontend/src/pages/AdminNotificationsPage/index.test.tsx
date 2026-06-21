import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminNotificationsPage } from "./index";

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAdminNpoReportsMock: vi.fn(),
  fetchOverdueRelationshipAlertsMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/admin", () => ({
  fetchOverdueRelationshipAlerts: mocks.fetchOverdueRelationshipAlertsMock,
}));

vi.mock("../../api/npoReports", () => ({
  fetchAdminNpoReports: mocks.fetchAdminNpoReportsMock,
}));

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

const report = {
  id: 1,
  npo: { id: 10, name: "ONG Reportada", email: "ong@example.com" },
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
  createdAt: "2026-06-18T12:00:00",
};

const overdueRelationship = {
  companyId: 20,
  companyName: "Empresa Parceira",
  npoId: 10,
  npoName: "ONG Parceira",
  projectId: 99,
  projectName: "Projeto Social",
  requestedAt: "2026-06-10T09:00:00",
};

function reportsPage(content = [report]) {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    number: 0,
    size: 100,
  };
}

describe("AdminNotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAdminNpoReportsMock.mockResolvedValue(reportsPage());
    mocks.fetchOverdueRelationshipAlertsMock.mockResolvedValue([overdueRelationship]);
  });

  it("renderiza notificações de denúncias abertas e vínculos vencidos", async () => {
    render(<AdminNotificationsPage />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Notificações")).toBeInTheDocument();

    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();
    expect(screen.getByText("Empresa Denunciante")).toBeInTheDocument();
    expect(screen.getByText("Projeto Social")).toBeInTheDocument();
    expect(screen.getByText("Empresa Parceira -> ONG Parceira")).toBeInTheDocument();
    expect(screen.getByText("Total pendente")).toBeInTheDocument();
    expect(screen.getByText("Denúncias abertas")).toBeInTheDocument();
    expect(screen.getByText("Vínculos vencidos")).toBeInTheDocument();
    expect(mocks.fetchAdminNpoReportsMock).toHaveBeenCalledWith("token", {
      page: 0,
      size: 100,
      status: "OPEN",
    });
    expect(mocks.fetchOverdueRelationshipAlertsMock).toHaveBeenCalledWith("token");
  });

  it("filtra por denúncias", async () => {
    const user = userEvent.setup();
    render(<AdminNotificationsPage />);

    expect(await screen.findByText("Projeto Social")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Denúncias" }));

    expect(screen.getByText("ONG Reportada")).toBeInTheDocument();
    expect(screen.queryByText("Projeto Social")).not.toBeInTheDocument();
  });

  it("filtra por vínculos vencidos", async () => {
    const user = userEvent.setup();
    render(<AdminNotificationsPage />);

    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Vínculos vencidos" }));

    expect(screen.getByText("Projeto Social")).toBeInTheDocument();
    expect(screen.queryByText("ONG Reportada")).not.toBeInTheDocument();
  });

  it("renderiza estado vazio", async () => {
    mocks.fetchAdminNpoReportsMock.mockResolvedValue(reportsPage([]));
    mocks.fetchOverdueRelationshipAlertsMock.mockResolvedValue([]);

    render(<AdminNotificationsPage />);

    expect(await screen.findByText("Nenhuma notificação encontrada.")).toBeInTheDocument();
  });

  it("renderiza aviso parcial quando alguma chamada falha", async () => {
    mocks.fetchOverdueRelationshipAlertsMock.mockRejectedValue(new Error("Falha"));

    render(<AdminNotificationsPage />);

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText("Algumas notificações não puderam ser carregadas."),
    ).toBeInTheDocument();
    expect(screen.getByText("ONG Reportada")).toBeInTheDocument();
  });
});
