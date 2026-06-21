import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ProporParceriaModal } from "./ProporParceriaModal"

const projects = [
  { id: 1, title: "Projeto A" },
  { id: 2, title: "Projeto B" },
]

const baseProps = {
  open: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  loading: false,
  projects,
  companyName: "ACME",
}

describe("ProporParceriaModal", () => {
  it("renderiza título e mensagem com o nome da empresa", () => {
    render(<ProporParceriaModal {...baseProps} />)
    expect(screen.getByText(/propor parceria/i)).toBeInTheDocument()
    expect(screen.getByText(/ACME/)).toBeInTheDocument()
  })

  it("submit desabilitado sem projeto selecionado", () => {
    render(<ProporParceriaModal {...baseProps} />)
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled()
  })

  it("seleciona projeto e chama onConfirm com o id correto", async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ProporParceriaModal {...baseProps} onConfirm={onConfirm} />)

    await user.click(screen.getByRole("combobox", { name: /projeto/i }))
    await user.click(await screen.findByRole("option", { name: /Projeto A/ }))
    await user.click(screen.getByRole("button", { name: /confirmar/i }))

    expect(onConfirm).toHaveBeenCalledWith(1)
  })

  it("sem projetos disponíveis mostra mensagem auxiliar", () => {
    render(<ProporParceriaModal {...baseProps} projects={[]} />)
    expect(
      screen.getByText(/não tem projetos disponíveis/i),
    ).toBeInTheDocument()
  })

  it("loading desabilita botões", () => {
    render(<ProporParceriaModal {...baseProps} loading />)
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /confirmando/i })).toBeDisabled()
  })

  it("clicar em Cancelar chama onClose", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ProporParceriaModal {...baseProps} onClose={onClose} />)
    await user.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
