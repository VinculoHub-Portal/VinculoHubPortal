import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectDetailsPage } from ".";
import type { ProjectDetails } from "./projectDetails.types";

const mocks = vi.hoisted(() => ({
  fetchProjectDetailsMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
  userMock: { "https://vinculohub/roles": ["COMPANY"] },
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    isAuthenticated: true,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: mocks.userMock,
  }),
}));

vi.mock("./fetchProjectDetails", () => ({
  fetchProjectDetails: mocks.fetchProjectDetailsMock,
}));

vi.mock("../../components/ong/ReportNpoModal", () => ({
  ReportNpoModal: ({ open, npoId }: { open: boolean; npoId: number }) =>
    open ? <div data-testid="report-modal">Modal de denúncia {npoId}</div> : null,
}));

const baseProject: ProjectDetails = {
  id: "proj-1",
  name: "Saúde em Movimento",
  description: "Unidade móvel de saúde.",
  fundingType: "Lei de Incentivo",
  requiredAmount: 75000,
  sdgLabels: ["Saúde e Bem-Estar"],
  progressPercent: 40,
  responsibleInstitution: null,
};

function renderPage(projectId = "proj-1", locationState?: object) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[{ pathname: `/projeto/${projectId}`, state: locationState }]}
      >
        <Routes>
          <Route path="/projeto/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/empresa/dashboard" element={<p>Dashboard da Empresa</p>} />
          <Route path="/ong/dashboard" element={<p>Dashboard da ONG</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProjectDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token-test");
    mocks.fetchProjectDetailsMock.mockResolvedValue(baseProject);
    mocks.userMock = { "https://vinculohub/roles": ["COMPANY"] };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("estado de loading", () => {
    it("exibe skeleton com aria-busy durante carregamento", () => {
      mocks.fetchProjectDetailsMock.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByRole("article", { name: /carregando/i })).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });
  });

  describe("estado de erro", () => {
    it("exibe botão Tentar novamente quando fetch falha", async () => {
      mocks.fetchProjectDetailsMock.mockRejectedValue(new Error("Network error"));
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
      });
    });
  });

  describe("projeto não encontrado", () => {
    it("exibe mensagem de projeto não encontrado", async () => {
      mocks.fetchProjectDetailsMock.mockResolvedValue(null);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Projeto não encontrado")).toBeInTheDocument();
      });
    });
  });

  describe("Lei de Incentivo", () => {
    it("exibe badge com valor formatado", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/75\.000,00/)).toBeInTheDocument();
      });
    });

    it("exibe badge do tipo de financiamento", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Lei de Incentivo")).toBeInTheDocument();
      });
    });
  });

  describe("Investimento Social Privado", () => {
    it("não exibe badge de valor monetário", async () => {
      mocks.fetchProjectDetailsMock.mockResolvedValue({
        ...baseProject,
        fundingType: "Investimento Social Privado",
        requiredAmount: 50000,
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument();
      });
      expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    });
  });

  describe("card de Organização Responsável", () => {
    it("exibe o card quando responsibleInstitution está preenchida", async () => {
      mocks.fetchProjectDetailsMock.mockResolvedValue({
        ...baseProject,
        responsibleInstitution: {
          npoId: 10,
          name: "Saúde Solidária",
          logoUrl: null,
          city: "Recife",
          stateCode: "PE",
          description: "ONG focada em saúde.",
        },
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Organização Responsável")).toBeInTheDocument();
        expect(screen.getByText("Saúde Solidária")).toBeInTheDocument();
      });
    });

    it("não exibe o card quando responsibleInstitution é null", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument();
      });
      expect(screen.queryByText("Organização Responsável")).not.toBeInTheDocument();
    });
  });

  describe("denúncia", () => {
    it("exibe o botão e abre o modal para empresa", async () => {
      const user = userEvent.setup();
      mocks.fetchProjectDetailsMock.mockResolvedValue({
        ...baseProject,
        responsibleInstitution: {
          npoId: 10,
          name: "Saúde Solidária",
          logoUrl: null,
          city: "Recife",
          stateCode: "PE",
          description: "ONG focada em saúde.",
        },
      });

      renderPage();

      expect(await screen.findByRole("button", { name: "Denunciar" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Denunciar" }));

      expect(screen.getByTestId("report-modal")).toHaveTextContent("10");
    });

    it("não exibe o botão para usuários que não são empresa", async () => {
      mocks.userMock = { "https://vinculohub/roles": ["NPO"] };
      mocks.fetchProjectDetailsMock.mockResolvedValue({
        ...baseProject,
        responsibleInstitution: {
          npoId: 10,
          name: "Saúde Solidária",
          logoUrl: null,
          city: "Recife",
          stateCode: "PE",
          description: "ONG focada em saúde.",
        },
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: "Denunciar" })).not.toBeInTheDocument();
      expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();
    });
  });

  describe("navegação — botão Voltar", () => {
    it("exibe 'Voltar ao Dashboard' sem returnTo no state", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/voltar ao dashboard/i)).toBeInTheDocument();
      });
    });

    it("exibe 'Voltar aos Projetos' quando returnTo é /ong/projetos", async () => {
      renderPage("proj-1", { returnTo: "/ong/projetos" });
      await waitFor(() => {
        expect(screen.getByText(/voltar aos projetos/i)).toBeInTheDocument();
      });
    });
  });
});
