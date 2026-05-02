import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { InvestmentModalitiesSection } from "./InvestmentModalitiesSection"

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return { ...actual, useNavigate: () => vi.fn() }
})

describe("InvestmentModalitiesSection", () => {
  it("renderiza o título da seção", () => {
    render(
      <MemoryRouter>
        <InvestmentModalitiesSection />
      </MemoryRouter>,
    )
    expect(screen.getByText("Modalidades de Investimento")).toBeInTheDocument()
  })

  it("renderiza o card de Leis de Incentivo", () => {
    render(
      <MemoryRouter>
        <InvestmentModalitiesSection />
      </MemoryRouter>,
    )
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument()
  })

  it("renderiza o card de Investimento Social Privado", () => {
    render(
      <MemoryRouter>
        <InvestmentModalitiesSection />
      </MemoryRouter>,
    )
    expect(screen.getByText("Investimento Social Privado")).toBeInTheDocument()
  })
})
