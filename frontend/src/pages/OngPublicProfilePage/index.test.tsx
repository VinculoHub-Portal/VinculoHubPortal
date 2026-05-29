import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { OngPublicProfilePage } from "."
import type { NpoProfileResponse } from "../../api/npo"

const mocks = vi.hoisted(() => ({
  useNpoProfile: vi.fn(),
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
}

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
    expect(screen.getByText("Carregando perfil…")).toBeInTheDocument()
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
