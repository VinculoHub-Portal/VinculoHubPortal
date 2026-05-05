import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleHomePage } from ".";

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchOdsCatalogMock: vi.fn(),
  createProjectMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/ods", () => ({
  fetchOdsCatalog: mocks.fetchOdsCatalogMock,
}));

vi.mock("../../api/projects", () => ({
  createProject: mocks.createProjectMock,
}));

function renderOngDashboard() {
  return render(
    <MemoryRouter initialEntries={["/ong/dashboard"]}>
      <Routes>
        <Route
          path="/ong/dashboard"
          element={
            <RoleHomePage
              title="Painel da ONG"
              description="Acompanhe seu cadastro, projetos e oportunidades para sua organização."
              showCreateProjectAction
            />
          }
        />
        <Route path="/ong/projetos" element={<p>Meus Projetos</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RoleHomePage - dashboard da ONG", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchOdsCatalogMock.mockResolvedValue([
      { id: 1, name: "ODS 1", description: "Erradicação da pobreza" },
    ]);
    mocks.createProjectMock.mockResolvedValue({ id: 1 });
  });

  it("renderiza o mock do dashboard da ONG", async () => {
    renderOngDashboard();

    await waitFor(() => {
      expect(mocks.fetchOdsCatalogMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument();
    expect(screen.getByText("Projetos por Tipo")).toBeInTheDocument();
    expect(screen.getByText("Status dos Projetos")).toBeInTheDocument();
    expect(screen.getByText("Educação Transformadora")).toBeInTheDocument();
    expect(
      screen.getByText("Novas Oportunidades de Financiamento Disponíveis"),
    ).toBeInTheDocument();
  });

  it("filtra projetos por status", async () => {
    renderOngDashboard();

    await userEvent.click(screen.getByRole("button", { name: "Em Captação" }));

    expect(screen.getByText("Saúde Comunitária")).toBeInTheDocument();
    expect(
      screen.queryByText("Educação Transformadora"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Cultura para Todos")).not.toBeInTheDocument();
  });

  it("navega para meus projetos pelo link de todos os projetos", async () => {
    renderOngDashboard();

    await userEvent.click(
      screen.getByRole("button", { name: /Ver todos os projetos/i }),
    );

    expect(screen.getByText("Meus Projetos")).toBeInTheDocument();
  });

  it("abre o modal de novo projeto", async () => {
    renderOngDashboard();

    await userEvent.click(
      screen.getByRole("button", { name: /Novo Projeto/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /Preencha os dados do projeto/i }),
    ).toBeInTheDocument();
  });
});
