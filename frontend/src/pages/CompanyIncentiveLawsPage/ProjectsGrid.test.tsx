import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ProjectsGrid } from "./ProjectsGrid"
import type { ProjectListItem } from "../../api/projects"

const makeProject = (overrides: Partial<ProjectListItem> = {}): ProjectListItem => ({
  id: 1,
  title: "Projeto Teste",
  status: "ACTIVE",
  npoId: 1,
  npoName: "ONG",
  npoPhone: "51999",
  startDate: "2026-01-01",
  ...overrides,
})

const mockProjects: ProjectListItem[] = [
  makeProject({ id: 1, title: "Projeto Alpha", budgetNeeded: 50000 }),
  makeProject({ id: 2, title: "Projeto Beta", budgetNeeded: 80000 }),
]

const onDetails = vi.fn()

describe("ProjectsGrid (Leis de Incentivo)", () => {
  it("exibe estado de loading", () => {
    render(<MemoryRouter><ProjectsGrid projects={[]} loading={true} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument()
  })

  it("exibe mensagem de erro", () => {
    render(<MemoryRouter><ProjectsGrid projects={[]} loading={false} error="Falha na rede" onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText(/Falha na rede/)).toBeInTheDocument()
  })

  it("exibe estado vazio quando não há projetos", () => {
    render(<MemoryRouter><ProjectsGrid projects={[]} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("Nenhum projeto disponível no momento.")).toBeInTheDocument()
  })

  it("renderiza os cards quando há projetos", () => {
    render(<MemoryRouter><ProjectsGrid projects={mockProjects} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("Projeto Alpha")).toBeInTheDocument()
    expect(screen.getByText("Projeto Beta")).toBeInTheDocument()
  })

  it("exibe badge de valor e barra de progresso (Leis de Incentivo)", () => {
    render(<MemoryRouter><ProjectsGrid projects={mockProjects} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("R$ 50.000")).toBeInTheDocument()
    expect(screen.getByText("R$ 80.000")).toBeInTheDocument()
    expect(screen.getAllByRole("progressbar")).toHaveLength(2)
  })

  it("exibe contagem correta de projetos encontrados", () => {
    render(<MemoryRouter><ProjectsGrid projects={mockProjects} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("2 projetos encontrados")).toBeInTheDocument()
  })

  it("exibe singular quando há 1 projeto", () => {
    render(<MemoryRouter><ProjectsGrid projects={[mockProjects[0]]} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("1 projeto encontrado")).toBeInTheDocument()
  })
})
