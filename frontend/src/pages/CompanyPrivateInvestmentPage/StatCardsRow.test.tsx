import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatCardsRow } from "./StatCardsRow"

describe("StatCardsRow (Investimento Social Privado)", () => {
  it("exibe o count de projetos quando não está carregando", () => {
    render(<StatCardsRow projectCount={2} loading={false} />)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("exibe '—' quando está carregando", () => {
    render(<StatCardsRow projectCount={2} loading={true} />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("exibe valores hardcoded de temas e match", () => {
    render(<StatCardsRow projectCount={0} loading={false} />)
    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByText("85%")).toBeInTheDocument()
  })

  it("renderiza os 3 labels", () => {
    render(<StatCardsRow projectCount={0} loading={false} />)
    expect(screen.getByText("Projetos sugeridos")).toBeInTheDocument()
    expect(screen.getByText("Temas disponíveis")).toBeInTheDocument()
    expect(screen.getByText("Match com seus interesses")).toBeInTheDocument()
  })
})
