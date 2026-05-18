import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OngProjectCard } from "./OngProjectCard"

const baseProject = {
  id: 1,
  status: "Ativo",
  fundingModel: "incentiveLaw" as const,
  amountNeeded: 150000,
  title: "Educação Transformadora",
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
    expect(screen.getByText(baseProject.description)).toBeInTheDocument()
    expect(screen.getByText("Educação")).toBeInTheDocument()
    expect(screen.getByText("Capacitação")).toBeInTheDocument()
  })

  it("não renderiza localidade", () => {
    render(<OngProjectCard {...baseProject} />)
    expect(screen.queryByText(/localidade/i)).not.toBeInTheDocument()
  })

  it("exibe badge de valor e progresso em incentiveLaw", () => {
    render(<OngProjectCard {...baseProject} fundingModel="incentiveLaw" />)

    expect(screen.getByText(/150\.000/)).toBeInTheDocument()
    const progressbar = screen.getByRole("progressbar", {
      name: "Progresso de Educação Transformadora",
    })
    expect(progressbar).toHaveAttribute("aria-valuenow", "75")
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("não exibe badge de valor nem progresso em privateInvestment", () => {
    render(<OngProjectCard {...baseProject} fundingModel="privateInvestment" amountNeeded={50000} progress={40} />)

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("não exibe badge de valor nem progresso em directCapture", () => {
    render(<OngProjectCard {...baseProject} fundingModel="directCapture" />)

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("clampa progresso fora do intervalo permitido", () => {
    render(<OngProjectCard {...baseProject} fundingModel="incentiveLaw" progress={140} />)

    const progressbar = screen.getByRole("progressbar")
    expect(progressbar).toHaveAttribute("aria-valuenow", "100")
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("aciona callbacks dos botões", () => {
    const onTimeline = vi.fn()
    const onDetails = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <OngProjectCard
        {...baseProject}
        onTimeline={onTimeline}
        onDetails={onDetails}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /Ver Linha do Tempo/i }))
    fireEvent.click(screen.getByRole("button", { name: /Detalhes do Projeto/i }))
    fireEvent.click(screen.getByRole("button", { name: /Editar Projeto/i }))
    fireEvent.click(screen.getByRole("button", { name: /Excluir Projeto/i }))

    expect(onTimeline).toHaveBeenCalledWith(1)
    expect(onDetails).toHaveBeenCalledWith(1)
    expect(onEdit).toHaveBeenCalledWith(1)
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it("renderiza botão Excluir Projeto habilitado", () => {
    render(<OngProjectCard {...baseProject} />)
    expect(screen.getByRole("button", { name: /Excluir Projeto/i })).not.toBeDisabled()
  })
})
