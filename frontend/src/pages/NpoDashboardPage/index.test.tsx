import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NpoDashboardPage } from ".";
import type { ProjectListItem, ProjectsSummary } from "../../types/project.types";

vi.mock("../../components/general/Header", () => ({
  Header: () => <div>Header</div>,
}));

const useProjectsMock = vi.fn();

vi.mock("../../hooks/useProjects", () => ({
  useProjects: () => useProjectsMock(),
}));

const projects: ProjectListItem[] = [
  {
    id: "education-transformadora",
    name: "Educação Transformadora",
    description: "Programa de reforço escolar.",
    status: "active",
    type: "tax_incentive_law",
    city: "São Paulo",
    state: "SP",
    progress: 75,
    tags: ["Educação"],
  },
  {
    id: "escola-verde",
    name: "Escola Verde",
    description: "Projeto de educação ambiental.",
    status: "completed",
    type: "private_social_investment",
    city: "Curitiba",
    state: "PR",
    progress: 100,
    tags: ["Meio Ambiente"],
  },
];

const summary: ProjectsSummary = {
  total: 2,
  active: 1,
  completed: 1,
  cancelled: 0,
  byType: {
    tax_incentive_law: 1,
    private_social_investment: 1,
  },
};

function renderPage() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NpoDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NpoDashboardPage", () => {
  it("renderiza os blocos de resumo e o preview de projetos", () => {
    useProjectsMock.mockReturnValue({
      projects,
      summary,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument();
    expect(screen.getByText("Projetos por Tipo")).toBeInTheDocument();
    expect(screen.getByText("Status dos Projetos")).toBeInTheDocument();
    expect(screen.getByText("Educação Transformadora")).toBeInTheDocument();
    expect(screen.getByText("Escola Verde")).toBeInTheDocument();
    expect(screen.getByText("Ver todos os projetos")).toBeInTheDocument();
  });

  it("renderiza erro no resumo quando a consulta falha", () => {
    useProjectsMock.mockReturnValue({
      projects: [],
      summary,
      isLoading: false,
      isError: true,
      error: new Error("erro"),
      refetch: vi.fn(),
    });

    renderPage();

    expect(
      screen.getByText("Não foi possível carregar o resumo de projetos agora."),
    ).toBeInTheDocument();
  });
});
