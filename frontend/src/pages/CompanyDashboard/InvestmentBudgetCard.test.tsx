import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { InvestmentBudgetCard } from "./InvestmentBudgetCard"

const mockData = {
  totalDisplay: "R$ 250.000",
  usedDisplay: "R$ 150.000",
  usedPercentage: 60,
}

describe("InvestmentBudgetCard", () => {
  it("exibe o valor total disponível", () => {
    render(<InvestmentBudgetCard data={mockData} />)
    expect(screen.getAllByText("R$ 250.000")).toHaveLength(2)
  })

  it("exibe o valor utilizado", () => {
    render(<InvestmentBudgetCard data={mockData} />)
    expect(screen.getByText("R$ 150.000")).toBeInTheDocument()
  })

  it("exibe o percentual utilizado no rodapé", () => {
    render(<InvestmentBudgetCard data={mockData} />)
    expect(screen.getByText("60% utilizado")).toBeInTheDocument()
  })

  it("exibe os labels 'Total disponível' e 'Utilizado'", () => {
    render(<InvestmentBudgetCard data={mockData} />)
    expect(screen.getByText("Total disponível")).toBeInTheDocument()
    expect(screen.getByText("Utilizado")).toBeInTheDocument()
  })
})
