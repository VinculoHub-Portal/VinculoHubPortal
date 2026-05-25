import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { EditalCard } from "./EditalCard"

describe("EditalCard", () => {
  const base = {
    title: "Edital de Cultura 2026",
    isActive: true,
    description: "Apoio a projetos culturais em comunidades",
    odsLabel: "ODS 4 - Educação de Qualidade",
    deadlineLine: "Prazo: 14/05/2026",
    fileName: "edital-cultura-2026.pdf",
    publishedLine: "Publicado em 28/02/2026",
  }

  it("renderiza título, status Ativo, ODS, prazo, arquivo e publicação", () => {
    render(<EditalCard {...base} fileUrl="https://s3.example.com/edital.pdf" />)
    expect(screen.getByText("Edital de Cultura 2026")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText(/Apoio a projetos culturais/)).toBeInTheDocument()
    expect(screen.getByText("ODS 4 - Educação de Qualidade")).toBeInTheDocument()
    expect(screen.getByText("Prazo: 14/05/2026")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /edital-cultura-2026\.pdf/i })).toHaveAttribute(
      "href",
      "https://s3.example.com/edital.pdf",
    )
    expect(screen.getByText("Publicado em 28/02/2026")).toBeInTheDocument()
  })

  it("mostra Encerrado quando isActive é false", () => {
    render(<EditalCard {...base} isActive={false} fileUrl="https://x.test/a.pdf" />)
    expect(screen.getByText("Encerrado")).toBeInTheDocument()
    expect(screen.queryByText("Ativo")).not.toBeInTheDocument()
  })

  it("renderiza botões de visualizar e baixar com URL do arquivo", () => {
    render(<EditalCard {...base} fileUrl="https://s3.example.com/edital.pdf" />)
    expect(screen.getByRole("button", { name: /visualizar documento/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /baixar documento/i })).toBeEnabled()
  })

  it("desabilita visualizar e baixar sem URL do arquivo", () => {
    render(<EditalCard {...base} fileUrl={null} />)
    expect(screen.getByRole("button", { name: /visualizar documento/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /baixar documento/i })).toBeDisabled()
  })

  it("não renderiza botões de candidatura", () => {
    render(<EditalCard {...base} fileUrl="https://x.test/a.pdf" />)
    expect(screen.queryByRole("button", { name: /candidat/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /submeter/i })).not.toBeInTheDocument()
  })

  it("abre o arquivo em nova aba ao clicar no ícone de visualizar", async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    render(<EditalCard {...base} fileUrl="https://s3.example.com/doc.pdf" />)
    await user.click(screen.getByRole("button", { name: /visualizar documento/i }))
    expect(openSpy).toHaveBeenCalledWith("https://s3.example.com/doc.pdf", "_blank", "noopener,noreferrer")
    openSpy.mockRestore()
  })
})
