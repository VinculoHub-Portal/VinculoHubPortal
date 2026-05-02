import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { SupportedProjectsCard } from "./SupportedProjectsCard"

const mockData = { active: 5, incentiveLaws: 3, privateInvestment: 2 }

describe("SupportedProjectsCard", () => {
  it("exibe os 3 valores de stats", () => {
    render(<SupportedProjectsCard data={mockData} />)
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("exibe os labels dos stats", () => {
    render(<SupportedProjectsCard data={mockData} />)
    expect(screen.getByText("Projetos ativos")).toBeInTheDocument()
    expect(screen.getByText("Leis de incentivo")).toBeInTheDocument()
    expect(screen.getByText("Investimento privado")).toBeInTheDocument()
  })

  it("exibe o botão 'Ver todos os projetos'", () => {
    render(<SupportedProjectsCard data={mockData} />)
    expect(screen.getByText("Ver todos os projetos")).toBeInTheDocument()
  })
})
