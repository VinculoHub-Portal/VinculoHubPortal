import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchAuthenticatedProfile } from "./me"

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock("../services/api", () => ({ api: { get: mocks.get } }))
vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}))

const mockProfile = {
  auth0Id: "auth0|123",
  email: "user@test.com",
  userId: 1,
  userType: "npo" as const,
  npoId: 10,
  companyId: null,
  companyName: null,
  registrationCompleted: true,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("fetchAuthenticatedProfile", () => {
  it("chama GET /api/me/profile com Authorization header", async () => {
    mocks.get.mockResolvedValue({ data: mockProfile })
    await fetchAuthenticatedProfile("meu-token")
    expect(mocks.get).toHaveBeenCalledWith("/api/me/profile", {
      headers: { Authorization: "Bearer meu-token" },
    })
  })

  it("retorna o perfil autenticado", async () => {
    mocks.get.mockResolvedValue({ data: mockProfile })
    const result = await fetchAuthenticatedProfile("token")
    expect(result.auth0Id).toBe("auth0|123")
    expect(result.userType).toBe("npo")
    expect(result.npoId).toBe(10)
    expect(result.registrationCompleted).toBe(true)
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.get.mockRejectedValue(new Error("401 Unauthorized"))
    await expect(fetchAuthenticatedProfile("token-invalido")).rejects.toThrow("401 Unauthorized")
  })
})
