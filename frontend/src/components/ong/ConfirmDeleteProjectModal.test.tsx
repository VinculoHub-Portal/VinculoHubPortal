import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ConfirmDeleteProjectModal } from "./ConfirmDeleteProjectModal"

const defaultProps = {
  open: true,
  projectTitle: "Projeto Teste",
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
}

describe("ConfirmDeleteProjectModal", () => {
  it("não renderiza quando open é false", () => {
    render(<ConfirmDeleteProjectModal {...defaultProps} open={false} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renderiza com o título do projeto interpolado", () => {
    render(<ConfirmDeleteProjectModal {...defaultProps} />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText(/"Projeto Teste"/)).toBeInTheDocument()
  })

  it("exibe o aviso de ação irreversível", () => {
    render(<ConfirmDeleteProjectModal {...defaultProps} />)
    expect(
      screen.getByText(/Esta ação não pode ser desfeita/i),
    ).toBeInTheDocument()
  })

  it("chama onCancel ao clicar em Cancelar", async () => {
    const onCancel = vi.fn()
    render(<ConfirmDeleteProjectModal {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("chama onConfirm ao clicar em Excluir", async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDeleteProjectModal {...defaultProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("chama onCancel ao clicar no overlay fora do card", async () => {
    const onCancel = vi.fn()
    render(<ConfirmDeleteProjectModal {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("dialog"))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("chama onCancel ao pressionar ESC", async () => {
    const onCancel = vi.fn()
    render(<ConfirmDeleteProjectModal {...defaultProps} onCancel={onCancel} />)
    await userEvent.keyboard("{Escape}")
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("não chama onCancel ao pressionar ESC quando isDeleting é true", async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteProjectModal
        {...defaultProps}
        isDeleting
        onCancel={onCancel}
      />,
    )
    await userEvent.keyboard("{Escape}")
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("exibe 'Excluindo...' e desabilita os botões quando isDeleting é true", () => {
    render(<ConfirmDeleteProjectModal {...defaultProps} isDeleting />)
    expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()
  })
})
