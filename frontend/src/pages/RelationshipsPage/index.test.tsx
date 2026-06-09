import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AuthenticatedProfile } from "../../api/me"
import type { RelationshipListItem } from "../../api/relationships"
import { RelationshipsPage } from "."

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAuthenticatedProfileMock: vi.fn(),
  fetchRelationshipsMock: vi.fn(),
  acceptRelationshipMock: vi.fn(),
  rejectRelationshipMock: vi.fn(),
  showToastMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}))

vi.mock("../../api/me", () => ({
  fetchAuthenticatedProfile: mocks.fetchAuthenticatedProfileMock,
}))

vi.mock("../../api/relationships", () => ({
  fetchRelationships: mocks.fetchRelationshipsMock,
  acceptRelationship: mocks.acceptRelationshipMock,
  rejectRelationship: mocks.rejectRelationshipMock,
}))

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mocks.showToastMock }),
}))

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}))

const npoProfile: AuthenticatedProfile = {
  auth0Id: "auth0|npo",
  email: "ong@example.com",
  userId: 1,
  userType: "npo",
  npoId: 10,
  companyId: null,
  registrationCompleted: true,
}

const pendingRelationship: RelationshipListItem = {
  projectId: 20,
  projectName: "Projeto Dev",
  partnerInstitutionId: 30,
  partnerInstitutionName: "Empresa Dev S.A.",
  status: "pending",
  partnerContactEmail: null,
  partnerContactPhone: null,
  canRespond: true,
  canConfirm: false,
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe("RelationshipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token")
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue(npoProfile)
    mocks.fetchRelationshipsMock.mockResolvedValue([pendingRelationship])
    mocks.acceptRelationshipMock.mockResolvedValue(undefined)
    mocks.rejectRelationshipMock.mockResolvedValue(undefined)
  })

  it("exibe estado de carregamento", () => {
    mocks.getAccessTokenSilentlyMock.mockReturnValue(new Promise(() => {}))

    render(<RelationshipsPage />)

    expect(
      screen.getByText("Carregando relacionamentos..."),
    ).toBeInTheDocument()
  })

  it("busca perfil e relacionamentos com o token", async () => {
    render(<RelationshipsPage />)

    await waitFor(() => {
      expect(mocks.fetchAuthenticatedProfileMock).toHaveBeenCalledWith("token")
      expect(mocks.fetchRelationshipsMock).toHaveBeenCalledWith(
        { status: "pending" },
        "token",
      )
    })
  })

  it("renderiza os cards de relacionamento", async () => {
    render(<RelationshipsPage />)

    expect(await screen.findByText("Projeto Dev")).toBeInTheDocument()
    expect(screen.getByText("Empresa Dev S.A.")).toBeInTheDocument()
  })

  it("filtra por status selecionado e busca novamente", async () => {
    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(
      screen.getByRole("tab", { name: "Em negociação" }),
    )

    await waitFor(() => {
      expect(mocks.fetchRelationshipsMock).toHaveBeenLastCalledWith(
        { status: "negotiation" },
        "token",
      )
    })
    expect(
      screen.getByRole("tab", { name: "Em negociação" }),
    ).toHaveAttribute("aria-selected", "true")
  })

  it("exibe estado vazio quando não há relacionamentos", async () => {
    mocks.fetchRelationshipsMock.mockResolvedValue([])

    render(<RelationshipsPage />)

    expect(
      await screen.findByText("Nenhum relacionamento encontrado"),
    ).toBeInTheDocument()
  })

  it("exibe erro inline quando a busca falha", async () => {
    mocks.fetchRelationshipsMock.mockRejectedValue(new Error("Network error"))

    render(<RelationshipsPage />)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar seus relacionamentos. Tente novamente.",
    )
  })

  it("aceita usando partnerInstitutionId para usuário NPO e busca novamente", async () => {
    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    )

    await waitFor(() => {
      expect(mocks.acceptRelationshipMock).toHaveBeenCalledWith(30, 20, "token")
      expect(mocks.fetchRelationshipsMock).toHaveBeenCalledTimes(2)
    })
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Contato aceito com sucesso.",
      "success",
    )
  })

  it("aceita usando profile.companyId para usuário COMPANY", async () => {
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({
      ...npoProfile,
      userType: "company",
      npoId: null,
      companyId: 99,
    })

    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    )

    await waitFor(() => {
      expect(mocks.acceptRelationshipMock).toHaveBeenCalledWith(99, 20, "token")
    })
  })

  it("confirma a recusa no modal e busca novamente", async () => {
    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(screen.getByRole("button", { name: "Recusar" }))
    expect(
      screen.getByRole("dialog", { name: "Recusar contato?" }),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole("button", { name: "Confirmar recusa" }),
    )

    await waitFor(() => {
      expect(mocks.rejectRelationshipMock).toHaveBeenCalledWith(30, 20, "token")
      expect(mocks.fetchRelationshipsMock).toHaveBeenCalledTimes(2)
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("não aceita quando companyId não pode ser resolvido", async () => {
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({
      ...npoProfile,
      userType: "company",
      npoId: null,
      companyId: null,
    })

    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    )

    expect(mocks.acceptRelationshipMock).not.toHaveBeenCalled()
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Não foi possível identificar a empresa deste relacionamento.",
      "error",
    )
  })

  it("não recusa quando companyId não pode ser resolvido", async () => {
    mocks.fetchAuthenticatedProfileMock.mockResolvedValue({
      ...npoProfile,
      userType: null,
      npoId: null,
      companyId: null,
    })

    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(screen.getByRole("button", { name: "Recusar" }))
    await userEvent.click(
      screen.getByRole("button", { name: "Confirmar recusa" }),
    )

    expect(mocks.rejectRelationshipMock).not.toHaveBeenCalled()
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Não foi possível identificar a empresa deste relacionamento.",
      "error",
    )
  })

  it("desabilita ações enquanto uma resposta está sendo enviada", async () => {
    const request = deferred<void>()
    mocks.acceptRelationshipMock.mockReturnValue(request.promise)

    render(<RelationshipsPage />)
    await screen.findByText("Projeto Dev")

    await userEvent.click(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    )

    expect(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "Recusar" })).toBeDisabled()

    request.resolve()
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Aceitar Contato" }),
      ).not.toBeDisabled()
    })
  })
})
