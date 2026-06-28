import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  fetchRelationshipsMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
}))

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}))
vi.mock("../api/relationships", () => ({
  fetchRelationships: mocks.fetchRelationshipsMock,
}))

import { useExistingRelationship } from "./useExistingRelationship"

describe("useExistingRelationship", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("tok")
  })

  it("retorna exists=true quando há vínculo para o projeto", async () => {
    mocks.fetchRelationshipsMock.mockResolvedValue([
      {
        projectId: 42,
        projectName: "X",
        partnerInstitutionId: 5,
        partnerInstitutionName: "Y",
        status: "pending",
        partnerContactEmail: null,
        partnerContactPhone: null,
        canRespond: false,
        canConfirm: false,
      },
    ])
    const { result } = renderHook(() => useExistingRelationship({ projectId: 42 }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exists).toBe(true)
    expect(result.current.status).toBe("pending")
    expect(result.current.relationship?.projectId).toBe(42)
  })

  it("retorna exists=true quando há vínculo para o (projeto, empresa)", async () => {
    mocks.fetchRelationshipsMock.mockResolvedValue([
      {
        projectId: 42,
        projectName: "X",
        partnerInstitutionId: 7,
        partnerInstitutionName: "ACME",
        status: "negotiation",
        partnerContactEmail: null,
        partnerContactPhone: null,
        canRespond: false,
        canConfirm: false,
      },
    ])
    const { result } = renderHook(() =>
      useExistingRelationship({ projectId: 42, companyId: 7 }),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exists).toBe(true)
    expect(result.current.status).toBe("negotiation")
  })

  it("retorna exists=false quando vínculo é com outra empresa", async () => {
    mocks.fetchRelationshipsMock.mockResolvedValue([
      {
        projectId: 42,
        projectName: "X",
        partnerInstitutionId: 99,
        partnerInstitutionName: "Outra",
        status: "active",
        partnerContactEmail: null,
        partnerContactPhone: null,
        canRespond: false,
        canConfirm: false,
      },
    ])
    const { result } = renderHook(() =>
      useExistingRelationship({ projectId: 42, companyId: 7 }),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exists).toBe(false)
    expect(result.current.status).toBeNull()
  })

  it("ignora vínculos com status inactive", async () => {
    mocks.fetchRelationshipsMock.mockResolvedValue([
      {
        projectId: 42,
        projectName: "X",
        partnerInstitutionId: 5,
        partnerInstitutionName: "Y",
        status: "inactive",
        partnerContactEmail: null,
        partnerContactPhone: null,
        canRespond: false,
        canConfirm: false,
      },
    ])
    const { result } = renderHook(() => useExistingRelationship({ projectId: 42 }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exists).toBe(false)
    expect(result.current.status).toBeNull()
  })

  it("não faz fetch quando projectId é null", async () => {
    const { result } = renderHook(() => useExistingRelationship({ projectId: null }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exists).toBe(false)
    expect(result.current.status).toBeNull()
    expect(mocks.fetchRelationshipsMock).not.toHaveBeenCalled()
  })

  it("retorna exists=false em caso de erro de rede", async () => {
    mocks.fetchRelationshipsMock.mockRejectedValue(new Error("Network"))
    const { result } = renderHook(() => useExistingRelationship({ projectId: 42 }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exists).toBe(false)
    expect(result.current.status).toBeNull()
  })
})
