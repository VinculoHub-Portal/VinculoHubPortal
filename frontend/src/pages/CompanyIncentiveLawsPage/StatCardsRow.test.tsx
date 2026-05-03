import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatCardsRow } from "./StatCardsRow"

describe("StatCardsRow (Leis de Incentivo)", () => {
  it("exibe o count de projetos quando não está carregando", () => {
    render(<StatCardsRow projectCount={4} loading={false} />)
    expect(screen.getByText("4")).toBeInTheDocument()
  })

  it("exibe '—' quando está carregando", () => {
    render(<StatCardsRow projectCount={4} loading={true} />)
    expect(screen.getByText("—")).toBeInTheDocument()
    expect(screen.queryByText("4")).not.toBeInTheDocument()
  })

  it("exibe valores hardcoded de leis e investimento médio", () => {
    render(<StatCardsRow projectCount={0} loading={false} />)
    expect(screen.getByText("6")).toBeInTheDocument()
    expect(screen.getByText("R$ 73k")).toBeInTheDocument()
  })

  it("renderiza os 3 labels", () => {
    render(<StatCardsRow projectCount={0} loading={false} />)
    expect(screen.getByText("Projetos disponíveis")).toBeInTheDocument()
    expect(screen.getByText("Leis disponíveis")).toBeInTheDocument()
    expect(screen.getByText("Investimento médio")).toBeInTheDocument()
  })
})
