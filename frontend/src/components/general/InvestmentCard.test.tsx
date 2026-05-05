import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { InvestmentCard } from "./InvestmentCard"

const mocks = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return { ...actual, useNavigate: () => mocks.navigateMock }
})

describe("InvestmentCard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("renderiza o título 'Investimento Social Privado'", () => {
    render(<MemoryRouter><InvestmentCard /></MemoryRouter>)
    expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument()
  })

  it("renderiza a descrição do card", () => {
    render(<MemoryRouter><InvestmentCard /></MemoryRouter>)
    expect(screen.getByText(/valores da sua empresa/i)).toBeInTheDocument()
  })

  it("não renderiza lista de projetos de exemplo", () => {
    render(<MemoryRouter><InvestmentCard /></MemoryRouter>)
    expect(screen.queryByText("Educação Ambiental nas Escolas")).not.toBeInTheDocument()
    expect(screen.queryByText("Saúde Comunitária")).not.toBeInTheDocument()
    expect(screen.queryByText("Inclusão Digital")).not.toBeInTheDocument()
  })

  it("clicar em 'Explorar oportunidades' navega para /empresa/investimento-social-privado", async () => {
    render(<MemoryRouter><InvestmentCard /></MemoryRouter>)
    await userEvent.click(screen.getByRole("button", { name: "Explorar oportunidades" }))
    expect(mocks.navigateMock).toHaveBeenCalledWith("/empresa/investimento-social-privado")
  })
})
