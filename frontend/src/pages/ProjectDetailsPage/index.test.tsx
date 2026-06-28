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
  userMock: { "https://vinculohub/roles": ["COMPANY"] } as Record<string, unknown>,
  createRelationshipMock: vi.fn(),
  showToastMock: vi.fn(),
  useExistingRelationshipMock: vi.fn(() => ({
    exists: false,
    relationship: null,
    status: null,
    loading: false,
    refetch: vi.fn(),
  })),
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

vi.mock("../../api/relationships", () => ({
  createRelationship: mocks.createRelationshipMock,
  fetchRelationships: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../hooks/useExistingRelationship", () => ({
  useExistingRelationship: mocks.useExistingRelationshipMock,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}));

const baseProject: ProjectDetails = {
  id: "1",
  name: "Saúde em Movimento",
  description: "Unidade móvel de saúde.",
  fundingType: "Lei de Incentivo",
  requiredAmount: 75000,
  sdgLabels: ["Saúde e Bem-Estar"],
  progressPercent: 40,
  generalProgress: 0,
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
    mocks.createRelationshipMock.mockReset();
    mocks.showToastMock.mockReset();
    mocks.useExistingRelationshipMock.mockReturnValue({
      exists: false,
      relationship: null,
      status: null,
      loading: false,
      refetch: vi.fn(),
    });
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
        expect(screen.getAllByText("Organização Responsável")[0]).toBeInTheDocument();
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

      const denuniciarButtons = await screen.findAllByRole("button", { name: "Denunciar" });
      expect(denuniciarButtons[0]).toBeInTheDocument();

      await user.click(denuniciarButtons[0]);

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

  describe("Demonstrar Interesse", () => {
    it("exibe botão Demonstrar Interesse para usuário COMPANY com projeto carregado", async () => {
      renderPage();
      expect(
        await screen.findByRole("button", { name: /demonstrar interesse/i }),
      ).toBeInTheDocument();
    });

    it("não exibe botão para NPO", async () => {
      mocks.userMock = { "https://vinculohub/roles": ["NPO"] };
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("button", { name: /demonstrar interesse/i }),
      ).not.toBeInTheDocument();
    });

    it("clicar no botão abre modal de confirmação", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(
        await screen.findByRole("button", { name: /demonstrar interesse/i }),
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("confirmar chama createRelationship e mostra toast de sucesso", async () => {
      mocks.createRelationshipMock.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      renderPage();
      await user.click(
        await screen.findByRole("button", { name: /demonstrar interesse/i }),
      );
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      await waitFor(() => {
        expect(mocks.createRelationshipMock).toHaveBeenCalled();
      });
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Interesse enviado com sucesso!",
        "success",
      );
    });

    it("erro genérico mostra toast de erro", async () => {
      mocks.createRelationshipMock.mockRejectedValueOnce(new Error("boom"));
      const user = userEvent.setup();
      renderPage();
      await user.click(
        await screen.findByRole("button", { name: /demonstrar interesse/i }),
      );
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      await waitFor(() => {
        expect(mocks.showToastMock).toHaveBeenCalledWith(
          "Não foi possível enviar o interesse. Tente novamente.",
          "error",
        );
      });
    });

    it("erro 409 (vínculo duplicado) mostra toast warning e desabilita botão", async () => {
      mocks.createRelationshipMock.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 409 },
      });
      const user = userEvent.setup();
      renderPage();
      await user.click(
        await screen.findByRole("button", { name: /demonstrar interesse/i }),
      );
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      await waitFor(() => {
        expect(mocks.showToastMock).toHaveBeenCalledWith(
          "Já existe vínculo em andamento para este projeto.",
          "warning",
        );
      });
      expect(
        await screen.findByRole("button", { name: /interesse já enviado/i }),
      ).toBeDisabled();
    });

    it("vínculo já existente desabilita botão e altera label", async () => {
      mocks.useExistingRelationshipMock.mockReturnValue({
        exists: true,
        relationship: null,
        status: "pending",
        loading: false,
        refetch: vi.fn(),
      });
      renderPage();
      const button = await screen.findByRole("button", { name: /interesse já enviado/i });
      expect(button).toBeDisabled();
    });

    it("vínculo ativo mostra label de projeto já ativo", async () => {
      mocks.useExistingRelationshipMock.mockReturnValue({
        exists: true,
        relationship: null,
        status: "active",
        loading: false,
        refetch: vi.fn(),
      });
      renderPage();
      const button = await screen.findByRole("button", { name: /projeto já ativo/i });
      expect(button).toBeDisabled();
    });
  });
});
