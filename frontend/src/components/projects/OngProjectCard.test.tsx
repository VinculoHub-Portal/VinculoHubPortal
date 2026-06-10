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
  generalProgress: 75,
  captureProgress: 60,
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

  it("exibe progresso geral para todos os tipos de projeto", () => {
    render(<OngProjectCard {...baseProject} fundingModel="incentiveLaw" />)

    const progressbar = screen.getByRole("progressbar", {
      name: "Progresso de Educação Transformadora",
    })
    expect(progressbar).toHaveAttribute("aria-valuenow", "75")
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("exibe badge de valor e progresso financeiro em incentiveLaw", () => {
    render(<OngProjectCard {...baseProject} fundingModel="incentiveLaw" />)

    expect(screen.getByText(/150\.000/)).toBeInTheDocument()
    const captureProgressbar = screen.getByRole("progressbar", {
      name: "Progresso de captação de Educação Transformadora",
    })
    expect(captureProgressbar).toHaveAttribute("aria-valuenow", "60")
    expect(screen.getByText("60%")).toBeInTheDocument()
  })

  it("exibe progresso geral mas não exibe badge nem progresso financeiro em privateInvestment", () => {
    render(<OngProjectCard {...baseProject} fundingModel="privateInvestment" amountNeeded={50000} />)

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Progresso de Educação Transformadora" })).toBeInTheDocument()
    expect(screen.queryByRole("progressbar", { name: /captação/i })).not.toBeInTheDocument()
  })

  it("exibe progresso geral mas não exibe badge nem progresso financeiro em directCapture", () => {
    render(<OngProjectCard {...baseProject} fundingModel="directCapture" />)

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Progresso de Educação Transformadora" })).toBeInTheDocument()
    expect(screen.queryByRole("progressbar", { name: /captação/i })).not.toBeInTheDocument()
  })

  it("clampa progresso geral fora do intervalo permitido", () => {
    render(<OngProjectCard {...baseProject} generalProgress={140} />)

    const progressbar = screen.getByRole("progressbar", {
      name: "Progresso de Educação Transformadora",
    })
    expect(progressbar).toHaveAttribute("aria-valuenow", "100")
  })

  it("aciona callbacks dos botões", () => {
    const onDetails = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <OngProjectCard
        {...baseProject}
        onDetails={onDetails}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /Detalhes do Projeto/i }))
    fireEvent.click(screen.getByRole("button", { name: /Editar Projeto/i }))
    fireEvent.click(screen.getByRole("button", { name: /Excluir Projeto/i }))

    expect(onDetails).toHaveBeenCalledWith(1)
    expect(onEdit).toHaveBeenCalledWith(1)
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it("renderiza botão Excluir Projeto habilitado", () => {
    render(<OngProjectCard {...baseProject} />)
    expect(screen.getByRole("button", { name: /Excluir Projeto/i })).not.toBeDisabled()
  })
})
