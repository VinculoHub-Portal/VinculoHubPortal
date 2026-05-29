import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OngProfilePage } from "."
import type { NpoProfileResponse } from "../../api/npo"

const mocks = vi.hoisted(() => ({
  useNpoProfile: vi.fn(),
  save: vi.fn(),
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
    user: { "https://vinculohub/roles": ["NPO"] },
  }),
}))

const ownerProfile: NpoProfileResponse = {
  viewerContext: "OWNER",
  institutionalData: {
    id: 1,
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
    email: "maria.santos@educacaoparatodos.org.br",
    auth0Id: "auth0|owner",
    userType: "npo",
  },
}

beforeEach(() => {
  mocks.save.mockResolvedValue(undefined)
  mocks.useNpoProfile.mockReturnValue({
    profile: ownerProfile,
    loading: false,
    error: null,
    save: mocks.save,
    refetch: vi.fn(),
  })
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/ong/perfil"]}>
      <Routes>
        <Route path="/ong/perfil" element={<OngProfilePage />} />
        <Route path="/ong/dashboard" element={<p>Dashboard da ONG</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OngProfilePage — carregamento", () => {
  it("exibe mensagem de carregamento enquanto loading=true", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      save: mocks.save,
      refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText("Carregando perfil…")).toBeInTheDocument()
  })

  it("exibe mensagem de erro quando error está presente", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: "Erro ao carregar perfil da ONG.",
      save: mocks.save,
      refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText("Erro ao carregar perfil da ONG.")).toBeInTheDocument()
  })
})

describe("OngProfilePage — viewerContext OWNER", () => {
  it("renderiza dados reais do perfil em modo visualização", () => {
    renderPage()

    expect(screen.getByText("Instituto Educação para Todos")).toBeInTheDocument()
    expect(screen.getByText("Organização dedicada à educação.")).toBeInTheDocument()
    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument()
    expect(screen.getByText("Maria Silva Santos")).toBeInTheDocument()
    expect(screen.getByText("contato@educacaoparatodos.org.br")).toBeInTheDocument()
  })

  it("exibe badge ESG Social derivado dos flags do backend", () => {
    renderPage()
    expect(screen.getByText("Social")).toBeInTheDocument()
  })

  it("exibe botão 'Editar Perfil' para OWNER", () => {
    renderPage()
    expect(screen.getByText("Editar Perfil")).toBeInTheDocument()
  })

  it("exibe card de perfil público para OWNER", () => {
    renderPage()
    expect(screen.getByLabelText("Link do perfil público")).toBeInTheDocument()
  })

  it("link público contém o id da ONG", () => {
    renderPage()
    const input = screen.getByLabelText<HTMLInputElement>("Link do perfil público")
    expect(input.value).toContain("/ong/publico/1")
  })

  it("alterna para modo edição ao clicar em 'Editar Perfil'", async () => {
    renderPage()
    await userEvent.click(screen.getByText("Editar Perfil"))
    expect(screen.getByLabelText("Nome da Organização")).toBeInTheDocument()
    expect(screen.getByText("Cancelar")).toBeInTheDocument()
    expect(screen.getByText("Salvar")).toBeInTheDocument()
  })

  it("cancela edição restaurando os valores originais", async () => {
    renderPage()
    await userEvent.click(screen.getByText("Editar Perfil"))

    const nameInput = screen.getByLabelText("Nome da Organização")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Nome Alterado")

    await userEvent.click(screen.getByText("Cancelar"))

    expect(screen.getByText("Instituto Educação para Todos")).toBeInTheDocument()
  })

  it("chama save ao clicar em 'Salvar' e volta ao modo visualização", async () => {
    const updatedProfile: NpoProfileResponse = {
      ...ownerProfile,
      institutionalData: { ...ownerProfile.institutionalData, name: "ONG Atualizada" },
    }
    mocks.save.mockImplementationOnce(async () => {
      mocks.useNpoProfile.mockReturnValue({
        profile: updatedProfile,
        loading: false,
        error: null,
        save: mocks.save,
        refetch: vi.fn(),
      })
    })

    renderPage()
    await userEvent.click(screen.getByText("Editar Perfil"))
    await userEvent.click(screen.getByText("Salvar"))

    await waitFor(() => {
      expect(mocks.save).toHaveBeenCalledOnce()
    })
    expect(screen.queryByLabelText("Nome da Organização")).not.toBeInTheDocument()
  })

  it("navega para o dashboard ao clicar em 'Voltar ao Dashboard'", async () => {
    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Voltar ao Dashboard" }))
    expect(screen.getByText("Dashboard da ONG")).toBeInTheDocument()
  })
})

describe("OngProfilePage — viewerContext EXTERNAL", () => {
  it("não exibe botão 'Editar Perfil' para EXTERNAL", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: { ...ownerProfile, viewerContext: "EXTERNAL" },
      loading: false,
      error: null,
      save: mocks.save,
      refetch: vi.fn(),
    })
    renderPage()
    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument()
  })

  it("não exibe card de perfil público para EXTERNAL", () => {
    mocks.useNpoProfile.mockReturnValue({
      profile: { ...ownerProfile, viewerContext: "EXTERNAL" },
      loading: false,
      error: null,
      save: mocks.save,
      refetch: vi.fn(),
    })
    renderPage()
    expect(screen.queryByLabelText("Link do perfil público")).not.toBeInTheDocument()
  })
})
