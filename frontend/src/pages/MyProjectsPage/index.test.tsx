import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MyProjectsPage } from ".";
import type { ProjectListItem, ProjectsSummary } from "../../types/project.types";

vi.mock("../../components/general/Header", () => ({
  Header: () => <div>Header</div>,
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

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
];

const summary: ProjectsSummary = {
  total: 1,
  active: 1,
  completed: 0,
  cancelled: 0,
  byType: {
    tax_incentive_law: 1,
    private_social_investment: 0,
  },
};

function renderPage() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MyProjectsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("MyProjectsPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("renderiza os cards de resumo e a lista de projetos", () => {
    useProjectsMock.mockReturnValue({
      projects,
      summary,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("Meus Projetos")).toBeInTheDocument();
    expect(screen.getByText("Total de Projetos")).toBeInTheDocument();
    expect(screen.getByText("Projetos Ativos")).toBeInTheDocument();
    expect(screen.getByText("Projetos Concluídos")).toBeInTheDocument();
    expect(screen.getByText("Educação Transformadora")).toBeInTheDocument();
  });

  it("renderiza estado vazio", () => {
    useProjectsMock.mockReturnValue({
      projects: [],
      summary: {
        ...summary,
        total: 0,
        active: 0,
        byType: {
          tax_incentive_law: 0,
          private_social_investment: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("Nenhum projeto cadastrado ainda")).toBeInTheDocument();
  });

  it("renderiza estado de erro", () => {
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
      screen.getByText("Não foi possível carregar os projetos"),
    ).toBeInTheDocument();
  });
});
