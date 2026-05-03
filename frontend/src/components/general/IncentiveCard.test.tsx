import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { IncentiveCard } from "./IncentiveCard"

const mocks = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return { ...actual, useNavigate: () => mocks.navigateMock }
})

describe("IncentiveCard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("renderiza o título 'Leis de Incentivo'", () => {
    render(<MemoryRouter><IncentiveCard /></MemoryRouter>)
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument()
  })

  it("renderiza as 6 leis de incentivo", () => {
    render(<MemoryRouter><IncentiveCard /></MemoryRouter>)
    expect(screen.getByText("Lei Rouanet (Federal)")).toBeInTheDocument()
    expect(screen.getByText("Lei do Audiovisual (Federal)")).toBeInTheDocument()
    expect(screen.getByText("Lei de Incentivo ao Esporte (Federal)")).toBeInTheDocument()
    expect(screen.getByText("Fundo do Idoso (Federal/Estadual/Municipal)")).toBeInTheDocument()
    expect(screen.getByText("Fundo de Criança e Adolescente (Federal/Estadual/Municipal)")).toBeInTheDocument()
    expect(screen.getByText("PRONON/PRONAS (Federal)")).toBeInTheDocument()
  })

  it("clicar em 'Ver projetos disponíveis' navega para /empresa/leis-de-incentivo", async () => {
    render(<MemoryRouter><IncentiveCard /></MemoryRouter>)
    await userEvent.click(screen.getByRole("button", { name: "Ver projetos disponíveis" }))
    expect(mocks.navigateMock).toHaveBeenCalledWith("/empresa/leis-de-incentivo")
  })
})
