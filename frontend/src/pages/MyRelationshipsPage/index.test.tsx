import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AuthenticatedProfile } from "../../api/me"
import type { RelationshipListItem } from "../../api/relationships"
import { MyRelationshipsPage } from "./index"

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  acceptRelationshipMock: vi.fn(),
  rejectRelationshipMock: vi.fn(),
  confirmRelationshipMock: vi.fn(),
  refetchMock: vi.fn(),
  showToastMock: vi.fn(),
}))

let profile: Pick<AuthenticatedProfile, "userType" | "companyId"> = {
  userType: "company",
  companyId: 42,
}

let relationships: RelationshipListItem[] = []

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
    user: {
      name: "Admin",
      nickname: "Admin",
    },
  }),
}))

vi.mock("../../hooks/useAuthProfile", () => ({
  useAuthProfile: () => ({ data: profile }),
}))

vi.mock("../../hooks/useMyRelationships", () => ({
  useMyRelationships: () => ({
    data: relationships,
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: mocks.refetchMock,
  }),
}))

vi.mock("../../api/relationships", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/relationships")>(
      "../../api/relationships",
    )
  return {
    ...actual,
    acceptRelationship: mocks.acceptRelationshipMock,
    rejectRelationship: mocks.rejectRelationshipMock,
    confirmRelationship: mocks.confirmRelationshipMock,
  }
})

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}))

const activeRelationship: RelationshipListItem = {
  projectId: 321,
  projectName: "Biblioteca Comunitária Sementes do Saber",
  partnerInstitutionId: 101,
  partnerInstitutionName: "Instituto Educação para Todos",
  status: "active",
  partnerContactEmail: "contato@educacaoparatodos.org.br",
  partnerContactPhone: "(11) 1234-5678",
  canRespond: false,
  canConfirm: false,
}

const negotiationRelationship: RelationshipListItem = {
  projectId: 323,
  projectName: "Educação Ambiental nas Escolas",
  partnerInstitutionId: 103,
  partnerInstitutionName: "Eco Futuro",
  status: "negotiation",
  partnerContactEmail: "contato@ecofuturo.org.br",
  partnerContactPhone: "(31) 2345-6789",
  canRespond: false,
  canConfirm: false,
}

const pendingRespondableRelationship: RelationshipListItem = {
  projectId: 444,
  projectName: "Horta Comunitária",
  partnerInstitutionId: 77,
  partnerInstitutionName: "Empresa Parceira",
  status: "pending",
  partnerContactEmail: null,
  partnerContactPhone: null,
  canRespond: true,
  canConfirm: false,
}

const negotiationConfirmableRelationship: RelationshipListItem = {
  projectId: 555,
  projectName: "Reflorestamento Urbano",
  partnerInstitutionId: 88,
  partnerInstitutionName: "Verde Vida",
  status: "negotiation",
  partnerContactEmail: "contato@verdevida.org.br",
  partnerContactPhone: "(11) 5555-5555",
  canRespond: false,
  canConfirm: true,
}

function renderMyRelationshipsPage() {
  render(
    <MemoryRouter initialEntries={["/meus-vinculos"]}>
      <MyRelationshipsPage />
    </MemoryRouter>,
  )
}

describe("MyRelationshipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.acceptRelationshipMock.mockResolvedValue(undefined)
    mocks.rejectRelationshipMock.mockResolvedValue(undefined)
    mocks.confirmRelationshipMock.mockResolvedValue(undefined)
    mocks.refetchMock.mockResolvedValue({})
    profile = { userType: "company", companyId: 42 }
    relationships = [activeRelationship, negotiationRelationship]
  })

  it("filtra os vínculos ao clicar em Em Negociação", async () => {
    const user = userEvent.setup()

    renderMyRelationshipsPage()

    expect(
      screen.getByText("Biblioteca Comunitária Sementes do Saber"),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Em Negociação/i }))

    expect(
      screen.queryByText("Biblioteca Comunitária Sementes do Saber"),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Educação Ambiental nas Escolas")).toBeInTheDocument()
    expect(screen.getByText("Aguardando confirmação da ONG")).toBeInTheDocument()
  })

  it("renderiza ações de resposta para vínculo pendente respondível", () => {
    relationships = [pendingRespondableRelationship]

    renderMyRelationshipsPage()

    expect(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Recusar" })).toBeInTheDocument()
  })

  it("não renderiza ações de resposta quando o vínculo pendente não pode ser respondido", () => {
    relationships = [
      {
        ...pendingRespondableRelationship,
        canRespond: false,
      },
    ]

    renderMyRelationshipsPage()

    expect(
      screen.queryByRole("button", { name: "Aceitar Contato" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Recusar" }),
    ).not.toBeInTheDocument()
  })

  it("aceita usando companyId do perfil quando usuário é COMPANY e recarrega a lista", async () => {
    const user = userEvent.setup()
    relationships = [pendingRespondableRelationship]

    renderMyRelationshipsPage()

    await user.click(screen.getByRole("button", { name: "Aceitar Contato" }))

    await waitFor(() => {
      expect(mocks.acceptRelationshipMock).toHaveBeenCalledWith(42, 444, "token")
      expect(mocks.refetchMock).toHaveBeenCalledOnce()
    })
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Contato aceito com sucesso.",
      "success",
    )
  })

  it("aceita usando partnerInstitutionId quando usuário é NPO", async () => {
    const user = userEvent.setup()
    profile = { userType: "npo", companyId: null }
    relationships = [pendingRespondableRelationship]

    renderMyRelationshipsPage()

    await user.click(screen.getByRole("button", { name: "Aceitar Contato" }))

    await waitFor(() => {
      expect(mocks.acceptRelationshipMock).toHaveBeenCalledWith(77, 444, "token")
    })
  })

  it("abre confirmação de recusa e recusa com companyId e projectId corretos", async () => {
    const user = userEvent.setup()
    relationships = [pendingRespondableRelationship]

    renderMyRelationshipsPage()

    await user.click(screen.getByRole("button", { name: "Recusar" }))
    expect(
      screen.getByRole("dialog", { name: "Recusar contato?" }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Confirmar recusa" }))

    await waitFor(() => {
      expect(mocks.rejectRelationshipMock).toHaveBeenCalledWith(42, 444, "token")
      expect(mocks.refetchMock).toHaveBeenCalledOnce()
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("não chama a API e exibe erro quando companyId não pode ser resolvido", async () => {
    const user = userEvent.setup()
    profile = { userType: "company", companyId: null }
    relationships = [pendingRespondableRelationship]

    renderMyRelationshipsPage()

    await user.click(screen.getByRole("button", { name: "Aceitar Contato" }))

    expect(mocks.acceptRelationshipMock).not.toHaveBeenCalled()
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Não foi possível identificar a empresa deste vínculo.",
      "error",
    )
  })

  describe("Efetivar Parceria", () => {
    it("clicar em Efetivar Parceria abre modal de confirmação", async () => {
      const user = userEvent.setup()
      relationships = [negotiationConfirmableRelationship]

      renderMyRelationshipsPage()

      await user.click(
        screen.getByRole("button", { name: "Efetivar Parceria" }),
      )

      expect(
        screen.getByRole("dialog", { name: "Efetivar Parceria" }),
      ).toBeInTheDocument()
    })

    it("confirmar chama confirmRelationship com (companyId, projectId, token) usando companyId do perfil quando viewer é COMPANY", async () => {
      const user = userEvent.setup()
      profile = { userType: "company", companyId: 42 }
      relationships = [negotiationConfirmableRelationship]

      renderMyRelationshipsPage()

      await user.click(
        screen.getByRole("button", { name: "Efetivar Parceria" }),
      )
      await user.click(screen.getByRole("button", { name: "Confirmar" }))

      await waitFor(() => {
        expect(mocks.confirmRelationshipMock).toHaveBeenCalledWith(
          42,
          555,
          "token",
        )
        expect(mocks.refetchMock).toHaveBeenCalledOnce()
      })
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Parceria confirmada com sucesso!",
        "success",
      )
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("confirmar usa partnerInstitutionId como companyId quando viewer é NPO", async () => {
      const user = userEvent.setup()
      profile = { userType: "npo", companyId: null }
      relationships = [negotiationConfirmableRelationship]

      renderMyRelationshipsPage()

      await user.click(
        screen.getByRole("button", { name: "Efetivar Parceria" }),
      )
      await user.click(screen.getByRole("button", { name: "Confirmar" }))

      await waitFor(() => {
        expect(mocks.confirmRelationshipMock).toHaveBeenCalledWith(
          88,
          555,
          "token",
        )
      })
    })

    it("erro ao efetivar mostra toast de erro", async () => {
      const user = userEvent.setup()
      relationships = [negotiationConfirmableRelationship]
      mocks.confirmRelationshipMock.mockRejectedValueOnce(new Error("boom"))

      renderMyRelationshipsPage()

      await user.click(
        screen.getByRole("button", { name: "Efetivar Parceria" }),
      )
      await user.click(screen.getByRole("button", { name: "Confirmar" }))

      await waitFor(() => {
        expect(mocks.showToastMock).toHaveBeenCalledWith(
          "Não foi possível efetivar a parceria. Tente novamente.",
          "error",
        )
      })
    })
  })
})
