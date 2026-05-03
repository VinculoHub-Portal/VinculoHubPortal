import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProjectsGrid } from "./ProjectsGrid"
import type { EnrichedProject } from "./mockData"

const mockProjects: EnrichedProject[] = [
  { id: 1, title: "Projeto Alpha", description: "Desc A", lawId: "rouanet", lawLabel: "Lei Rouanet", targetAmount: 50000, progressPercent: 60, location: "SP, SP" },
  { id: 2, title: "Projeto Beta", description: "Desc B", lawId: "esporte", lawLabel: "Lei do Esporte", targetAmount: 80000, progressPercent: 30, location: "RJ, RJ" },
]

describe("ProjectsGrid (Leis de Incentivo)", () => {
  it("exibe estado de loading", () => {
    render(<ProjectsGrid projects={[]} loading={true} error={null} />)
    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument()
  })

  it("exibe mensagem de erro", () => {
    render(<ProjectsGrid projects={[]} loading={false} error="Falha na rede" />)
    expect(screen.getByText(/Falha na rede/)).toBeInTheDocument()
  })

  it("exibe estado vazio quando não há projetos", () => {
    render(<ProjectsGrid projects={[]} loading={false} error={null} />)
    expect(screen.getByText("Nenhum projeto encontrado para este filtro.")).toBeInTheDocument()
  })

  it("renderiza os cards quando há projetos", () => {
    render(<ProjectsGrid projects={mockProjects} loading={false} error={null} />)
    expect(screen.getByText("Projeto Alpha")).toBeInTheDocument()
    expect(screen.getByText("Projeto Beta")).toBeInTheDocument()
  })

  it("exibe contagem correta de projetos encontrados", () => {
    render(<ProjectsGrid projects={mockProjects} loading={false} error={null} />)
    expect(screen.getByText("2 projetos encontrados")).toBeInTheDocument()
  })

  it("exibe singular quando há 1 projeto", () => {
    render(<ProjectsGrid projects={[mockProjects[0]]} loading={false} error={null} />)
    expect(screen.getByText("1 projeto encontrado")).toBeInTheDocument()
  })
})
