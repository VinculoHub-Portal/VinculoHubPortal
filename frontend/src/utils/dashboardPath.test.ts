import { describe, it, expect } from "vitest"
import { resolveDashboardPath } from "./dashboardPath"

const ROLES_CLAIM = "https://vinculohub/roles"

function makeUser(roles: string[]) {
  return { sub: "auth0|123", [ROLES_CLAIM]: roles }
}

describe("resolveDashboardPath", () => {
  it("retorna /admin/dashboard para role ADMIN", () => {
    expect(resolveDashboardPath(makeUser(["ADMIN"]))).toBe("/admin/dashboard")
  })

  it("retorna /ong/dashboard para role NPO", () => {
    expect(resolveDashboardPath(makeUser(["NPO"]))).toBe("/ong/dashboard")
  })

  it("retorna /empresa/dashboard para role COMPANY", () => {
    expect(resolveDashboardPath(makeUser(["COMPANY"]))).toBe("/empresa/dashboard")
  })

  it("retorna / quando não há roles conhecidas", () => {
    expect(resolveDashboardPath(makeUser(["UNKNOWN"]))).toBe("/")
  })

  it("retorna / quando roles está vazio", () => {
    expect(resolveDashboardPath(makeUser([]))).toBe("/")
  })

  it("retorna / quando user é undefined", () => {
    expect(resolveDashboardPath(undefined)).toBe("/")
  })

  it("ADMIN tem prioridade sobre NPO quando ambos presentes", () => {
    expect(resolveDashboardPath(makeUser(["NPO", "ADMIN"]))).toBe("/admin/dashboard")
  })

  it("NPO tem prioridade sobre COMPANY quando ambos presentes", () => {
    expect(resolveDashboardPath(makeUser(["COMPANY", "NPO"]))).toBe("/ong/dashboard")
  })

  it("normaliza roles para maiúsculo (admin minúsculo redireciona como ADMIN)", () => {
    expect(resolveDashboardPath(makeUser(["admin"]))).toBe("/admin/dashboard")
  })

  it("funciona quando roles claim não é array (retorna /)", () => {
    const user = { sub: "auth0|123", [ROLES_CLAIM]: "ADMIN" }
    expect(resolveDashboardPath(user)).toBe("/")
  })
})
