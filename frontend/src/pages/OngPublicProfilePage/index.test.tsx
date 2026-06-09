import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OngPublicProfilePage } from "."
import type { NpoProfileProjectPage, NpoProfileResponse } from "../../api/npo"

const mocks = vi.hoisted(() => ({
  fetchNpoProfileProjects: vi.fn(),
  useNpoProfile: vi.fn(),
}))

vi.mock("../../api/npo", () => ({
  fetchNpoProfileProjects: mocks.fetchNpoProfileProjects,
}))

vi.mock("../../hooks/useNpoProfile", () => ({
  useNpoProfile: mocks.useNpoProfile,
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn(),
    isAuthenticated: true,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    user: { "https://vinculohub/roles": ["COMPANY"] },
  }),
}))

const externalProfile: NpoProfileResponse = {
  viewerContext: "EXTERNAL",
  institutionalData: {
    id: 42,
    name: "Instituto Educação para Todos",
    description: "Organização dedicada à educação.",
    logoUrl: null,
    npoSize: "medium",
    cnpj: "12.345.678/0001-90",
    cpf: null,
    environmental: false,
    social: true,
    governance: false,
  },
  contact: {
    email: "contato@educacaoparatodos.org.br",
    phone: "(11) 3000-0000",
  },
  address: {
    id: 1,
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
    street: "Av. Paulista",
    number: "1000",
    complement: null,
    zipCode: "01310-100",
  },
  responsible: {
    id: 1,
    name: "Maria Silva Santos",
    email: "maria@ong.org",
    auth0Id: "auth0|owner",
    userType: "npo",
  },
  projects: [],
}

const projectsPage: NpoProfileProjectPage = {
  content: [
    {
      id: 100,
      title: "Projeto Alfabetizacao",
      description: "Aulas no contraturno.",
      status: "ACTIVE",
      type: "SOCIAL_INVESTMENT_LAW",
      budgetNeeded: 50000,
      investedAmount: 10000,
      ods: [
        {
          id: 4,
          name: "ODS 4 - Educacao de Qualidade",
          description: "Educacao inclusiva e equitativa.",
        },
      ],
      startDate: "2026-01-10",
      endDate: null,
      focusArea: null,
      fundraisingDeadline: null,
      beneficiariesCount: 120,
      location: "Sao Paulo",
      mainObjective: "Ampliar acesso a educacao.",
      createdAt: "2026-03-15T12:00:00",
    },
  ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 5,
    first: true,
    last: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.fetchNpoProfileProjects.mockResolvedValue(projectsPage)
})

function renderPage(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/ong/publico/${id}`]}>
      <Routes>
        <Route path="/ong/publico/:id" element={<OngPublicProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OngPublicProfilePage", () => {
  it("exibe estado de carregamento enquanto loading=true", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")
    expect(screen.getByText("Carregando perfil...")).toBeInTheDocument()
    expect(screen.getAllByLabelText("Carregando projeto")).toHaveLength(3)
  })

  it("exibe estado de erro quando perfil não encontrado", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: "ONG não encontrada.",
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("999")
    expect(screen.getByText("Perfil não encontrado")).toBeInTheDocument()
  })

  it("renderiza o perfil com id válido", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")

    expect(screen.getByText("Instituto Educação para Todos")).toBeInTheDocument()
    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument()
    expect(screen.getByText("Maria Silva Santos")).toBeInTheDocument()
  })

  it("renderiza os projetos da ONG com nome, status e ODS", async () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")

    expect(await screen.findByText("Projetos Publicados (1)")).toBeInTheDocument()
    expect(screen.getByText("Projeto Alfabetizacao")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText("ODS 4 - Educacao de Qualidade")).toBeInTheDocument()
    expect(screen.getByText("Publicado em 15/03/2026")).toBeInTheDocument()
  })

  it("solicita a proxima pagina de projetos ao clicar na paginacao", async () => {
    mocks.fetchNpoProfileProjects.mockResolvedValueOnce({
      content: Array.from({ length: 5 }, (_, index) => ({
        ...projectsPage.content[0],
        id: 100 + index,
        title: `Projeto ${index + 1}`,
        createdAt: `2026-03-${String(index + 1).padStart(2, "0")}T12:00:00`,
      })),
      totalElements: 6,
      totalPages: 2,
      number: 0,
      size: 5,
      first: true,
      last: false,
    })

    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")

    expect(await screen.findByText("Projetos Publicados (6)")).toBeInTheDocument()
    expect(screen.getByText("Projeto 1")).toBeInTheDocument()
    expect(screen.getByText("Projeto 5")).toBeInTheDocument()
    expect(screen.queryByText("Projeto 6")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /próxima página/i }))

    expect(mocks.fetchNpoProfileProjects).toHaveBeenLastCalledWith(42, 1, 5)
  })

  it("exibe estado vazio quando a ONG nao possui projetos", async () => {
    mocks.fetchNpoProfileProjects.mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 5,
      first: true,
      last: true,
    })
    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")

    expect(
      await screen.findByText("Esta ONG ainda não possui projetos cadastrados."),
    ).toBeInTheDocument()
  })

  it("chama useNpoProfile com o id numérico da URL", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")
    expect(mocks.useNpoProfile).toHaveBeenCalledWith(42)
  })

  it("não exibe botão 'Editar Perfil'", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")
    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument()
    expect(screen.queryByText("Editar Projeto")).not.toBeInTheDocument()
    expect(screen.queryByText("Excluir Projeto")).not.toBeInTheDocument()
  })

  it("não exibe card 'Perfil Público'", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: externalProfile,
      loading: false,
      error: null,
      save: vi.fn(),
      refetch: vi.fn(),
    })
    renderPage("42")
    expect(screen.queryByLabelText("Link do perfil público")).not.toBeInTheDocument()
  })
})
