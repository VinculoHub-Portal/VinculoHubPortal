import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminNotificationsPage } from "./index";

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

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}));

const mockReport = {
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

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminNotificationsPage />
    </MemoryRouter>,
  );
}

describe("AdminNotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      configurable: true,
    });
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAdminNpoReportsMock.mockResolvedValue({
      content: [mockReport],
      totalElements: 1,
      totalPages: 2,
      number: 0,
      size: 5,
    });
    mocks.updateAdminNpoReportStatusMock.mockResolvedValue(mockReport);
  });

  it("renderiza as denúncias e permite atualizar o status", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Denúncias de ONGs")).toBeInTheDocument();
    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();
    expect(screen.getByText("Empresa Denunciante")).toBeInTheDocument();
    expect(screen.getByText("empresa@example.com")).toBeInTheDocument();
    expect(screen.getByText("1 pendência")).toBeInTheDocument();

    const select = screen.getByRole("combobox", {
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

  it("pagina para o próximo lote de denúncias", async () => {
    const user = userEvent.setup();

    renderPage();
    expect(await screen.findByText("ONG Reportada")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima página" }));

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
});
