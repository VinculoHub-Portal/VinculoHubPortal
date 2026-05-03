import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OngProjectCard } from "./OngProjectCard"

const baseProject = {
  id: 1,
  status: "Ativo",
  amountNeeded: 150000,
  title: "Educação Transformadora",
  location: "São Paulo, SP",
  description: "Programa de reforço escolar para jovens em vulnerabilidade.",
  progress: 75,
  tags: ["Educação", "Capacitação"],
}

describe("OngProjectCard", () => {
  it("renderiza os dados principais do projeto", () => {
    render(<OngProjectCard {...baseProject} />)

    expect(
      screen.getByRole("article", { name: /Projeto Educação Transformadora/i }),
    ).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText((text) => text.includes("150.000"))).toBeInTheDocument()
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument()
    expect(screen.getByText(baseProject.description)).toBeInTheDocument()
    expect(screen.getByText("Educação")).toBeInTheDocument()
    expect(screen.getByText("Capacitação")).toBeInTheDocument()
  })

  it("exibe percentual e largura visual do progresso", () => {
    render(<OngProjectCard {...baseProject} />)

    const progressbar = screen.getByRole("progressbar", {
      name: "Progresso de Educação Transformadora",
    })
    expect(progressbar).toHaveAttribute("aria-valuenow", "75")
    expect(screen.getByText("75%")).toBeInTheDocument()
    expect((progressbar.firstElementChild as HTMLElement).style.width).toBe("75%")
  })

  it("clampa progresso fora do intervalo permitido", () => {
    render(<OngProjectCard {...baseProject} progress={140} />)

    const progressbar = screen.getByRole("progressbar")
    expect(progressbar).toHaveAttribute("aria-valuenow", "100")
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("aciona callbacks dos botões", () => {
    const onTimeline = vi.fn()
    const onDetails = vi.fn()
    const onEdit = vi.fn()

    render(
      <OngProjectCard
        {...baseProject}
        onTimeline={onTimeline}
        onDetails={onDetails}
        onEdit={onEdit}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /Ver Linha do Tempo/i }))
    fireEvent.click(screen.getByRole("button", { name: /Detalhes do Projeto/i }))
    fireEvent.click(screen.getByRole("button", { name: /Editar Projeto/i }))

    expect(onTimeline).toHaveBeenCalledWith(1)
    expect(onDetails).toHaveBeenCalledWith(1)
    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
