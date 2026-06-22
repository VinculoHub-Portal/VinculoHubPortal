import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminVinculosList } from "../AdminVinculosList";
import { AdminVinculosPage } from "./index";

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAdminRelationshipsMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/admin", () => ({
  fetchAdminRelationships: mocks.fetchAdminRelationshipsMock,
}));

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

const mockRelationship = {
  companyId: 7,
  companyName: "Empresa Verde",
  companyEmail: "contato@empresa.com",
  npoId: 9,
  npoName: "ONG Azul",
  npoEmail: "contato@ong.org",
  projectId: 99,
  projectTitle: "Projeto Impacto",
  status: "active" as const,
  initiatorType: "company" as const,
  createdAt: "2026-05-20T10:00:00",
  updatedAt: "2026-05-29T12:00:00",
  respondedAt: "2026-05-21T10:00:00",
  companyConfirmedAt: null,
  npoConfirmedAt: null,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminVinculosPage>
        <AdminVinculosList />
      </AdminVinculosPage>
    </MemoryRouter>,
  );
}

describe("AdminVinculosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      configurable: true,
    });
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAdminRelationshipsMock.mockResolvedValue({
      content: [mockRelationship],
      totalElements: 1,
      totalPages: 2,
      number: 0,
      size: 10,
      first: true,
      last: false,
    });
  });

  it("renderiza os vínculos e permite paginar", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Vínculos")).toBeInTheDocument();
    expect(await screen.findByText("Projeto Impacto")).toBeInTheDocument();
    expect(screen.getByText("Empresa Verde")).toBeInTheDocument();
    expect(screen.getByText("ONG Azul")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Iniciado pela empresa")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projeto Impacto" })).toHaveAttribute(
      "href",
      "/projeto/99",
    );

    await user.click(screen.getByRole("button", { name: "Próxima página" }));

    await waitFor(() =>
      expect(mocks.fetchAdminRelationshipsMock).toHaveBeenLastCalledWith("token", {
        companyName: undefined,
        npoName: undefined,
        projectTitle: undefined,
        status: "all",
        page: 1,
        size: 10,
      }),
    );
  });
});
