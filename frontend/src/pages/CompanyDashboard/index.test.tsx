import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { CompanyDashboard } from "./index"

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}))

describe("CompanyDashboard", () => {
  it("renderiza o título 'Dashboard Empresarial'", () => {
    render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
    expect(screen.getByText("Dashboard Empresarial")).toBeInTheDocument()
  })

  it("renderiza a saudação com o nome mockado", () => {
    render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
    expect(screen.getByText(/Bem-vindo de volta, Empresa ABC/)).toBeInTheDocument()
  })

  it("renderiza a seção de investimento disponível", () => {
    render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
    expect(screen.getByText("Investimento Disponível")).toBeInTheDocument()
  })

  it("renderiza a seção de projetos apoiados", () => {
    render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
    expect(screen.getByText("Projetos Apoiados")).toBeInTheDocument()
  })

  it("renderiza a seção de modalidades de investimento", () => {
    render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
    expect(screen.getByText("Modalidades de Investimento")).toBeInTheDocument()
  })

  it("renderiza a seção de impacto ESG", () => {
    render(<MemoryRouter><CompanyDashboard /></MemoryRouter>)
    expect(screen.getByText("Impacto ESG")).toBeInTheDocument()
  })
})
