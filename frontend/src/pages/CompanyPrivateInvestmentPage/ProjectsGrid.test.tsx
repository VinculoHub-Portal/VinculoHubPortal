import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProjectsGrid } from "./ProjectsGrid"
import type { SocialEnrichedProject } from "./mockData"

const mockProjects: SocialEnrichedProject[] = [
  { id: 1, title: "Saúde em Movimento", description: "Desc", themes: ["saude"], primaryThemeLabel: "Saúde", targetAmount: 75000, progressPercent: 40, location: "Recife, PE" },
  { id: 2, title: "Tecnologia Inclusiva", description: "Desc", themes: ["inclusao"], primaryThemeLabel: "Inclusão", targetAmount: 85000, progressPercent: 80, location: "Porto Alegre, RS" },
]

describe("ProjectsGrid (Investimento Social)", () => {
  it("exibe estado de loading", () => {
    render(<ProjectsGrid projects={[]} loading={true} error={null} />)
    expect(screen.getByText("Carregando projetos...")).toBeInTheDocument()
  })

  it("exibe mensagem de erro", () => {
    render(<ProjectsGrid projects={[]} loading={false} error="Timeout" />)
    expect(screen.getByText(/Timeout/)).toBeInTheDocument()
  })

  it("exibe estado vazio para temas sem projetos", () => {
    render(<ProjectsGrid projects={[]} loading={false} error={null} />)
    expect(screen.getByText("Nenhum projeto encontrado para os temas selecionados.")).toBeInTheDocument()
  })

  it("renderiza título 'Todos os Projetos Sugeridos'", () => {
    render(<ProjectsGrid projects={mockProjects} loading={false} error={null} />)
    expect(screen.getByText("Todos os Projetos Sugeridos")).toBeInTheDocument()
  })

  it("renderiza os cards com títulos dos projetos", () => {
    render(<ProjectsGrid projects={mockProjects} loading={false} error={null} />)
    expect(screen.getByText("Saúde em Movimento")).toBeInTheDocument()
    expect(screen.getByText("Tecnologia Inclusiva")).toBeInTheDocument()
  })

  it("exibe contagem de projetos encontrados", () => {
    render(<ProjectsGrid projects={mockProjects} loading={false} error={null} />)
    expect(screen.getByText("2 projetos encontrados")).toBeInTheDocument()
  })
})
