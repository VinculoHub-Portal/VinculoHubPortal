import { describe, expect, it } from "vitest"
import { formatEditalDatePtBr } from "./editalDisplay"

describe("formatEditalDatePtBr", () => {
  it("formata ISO em UTC para dd/mm/aaaa", () => {
    expect(formatEditalDatePtBr("2026-05-14T00:00:00.000Z")).toBe("14/05/2026")
  })

  it("retorna null para valor inválido", () => {
    expect(formatEditalDatePtBr(null)).toBeNull()
    expect(formatEditalDatePtBr("")).toBeNull()
  })
})
