import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchOdsCatalog } from "./ods"

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock("../services/api", () => ({ api: { get: mocks.get } }))

const mockCatalog = [
  { id: 1, name: "Erradicação da Pobreza", description: "ODS 1" },
  { id: 2, name: "Fome Zero", description: "ODS 2" },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe("fetchOdsCatalog", () => {
  it("chama GET /public/ods", async () => {
    mocks.get.mockResolvedValue({ data: mockCatalog })
    await fetchOdsCatalog()
    expect(mocks.get).toHaveBeenCalledWith("/public/ods")
  })

  it("retorna o catálogo de ODS", async () => {
    mocks.get.mockResolvedValue({ data: mockCatalog })
    const result = await fetchOdsCatalog()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("Erradicação da Pobreza")
    expect(result[1].id).toBe(2)
  })

  it("retorna lista vazia quando API retorna lista vazia", async () => {
    mocks.get.mockResolvedValue({ data: [] })
    const result = await fetchOdsCatalog()
    expect(result).toEqual([])
  })

  it("propaga erro quando a requisição falha", async () => {
    mocks.get.mockRejectedValue(new Error("Network error"))
    await expect(fetchOdsCatalog()).rejects.toThrow("Network error")
  })
})
