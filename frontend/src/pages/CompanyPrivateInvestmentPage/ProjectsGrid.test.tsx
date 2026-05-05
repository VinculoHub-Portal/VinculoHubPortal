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
  makeProject({ id: 1, title: "Saúde em Movimento" }),
  makeProject({ id: 2, title: "Tecnologia Inclusiva" }),
]

const onDetails = vi.fn()

describe("ProjectsGrid (Investimento Social)", () => {
  it("exibe estado de loading", () => {
    render(<MemoryRouter><ProjectsGrid projects={[]} loading={true} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument()
  })

  it("exibe mensagem de erro", () => {
    render(<MemoryRouter><ProjectsGrid projects={[]} loading={false} error="Timeout" onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText(/Timeout/)).toBeInTheDocument()
  })

  it("exibe estado vazio quando não há projetos", () => {
    render(<MemoryRouter><ProjectsGrid projects={[]} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("Nenhum projeto disponível no momento.")).toBeInTheDocument()
  })

  it("renderiza os cards com títulos dos projetos", () => {
    render(<MemoryRouter><ProjectsGrid projects={mockProjects} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument()
    expect(screen.getByText("Tecnologia Inclusiva")).toBeInTheDocument()
  })

  it("exibe contagem de projetos encontrados", () => {
    render(<MemoryRouter><ProjectsGrid projects={mockProjects} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.getByText("2 projetos encontrados")).toBeInTheDocument()
  })

  it("não exibe badge de valor nem barra de progresso (Investimento Social Privado)", () => {
    const projects = [makeProject({ id: 1, title: "P1", budgetNeeded: 50000, progressPercent: 40 })]
    render(<MemoryRouter><ProjectsGrid projects={projects} loading={false} error={null} onDetails={onDetails} /></MemoryRouter>)
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })
})
