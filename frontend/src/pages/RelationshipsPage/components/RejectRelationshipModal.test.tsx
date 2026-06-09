import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { RejectRelationshipModal } from "./RejectRelationshipModal"

const defaultProps = {
  open: true,
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
}

describe("RejectRelationshipModal", () => {
  it("não renderiza quando está fechado", () => {
    render(<RejectRelationshipModal {...defaultProps} open={false} />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renderiza título e descrição da recusa", () => {
    render(<RejectRelationshipModal {...defaultProps} />)

    expect(
      screen.getByRole("dialog", { name: "Recusar contato?" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/a instituição parceira será informada/i),
    ).toBeInTheDocument()
  })

  it("chama onCancel ao clicar em Cancelar", async () => {
    const onCancel = vi.fn()
    render(<RejectRelationshipModal {...defaultProps} onCancel={onCancel} />)

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("chama onConfirm ao clicar em Confirmar recusa", async () => {
    const onConfirm = vi.fn()
    render(<RejectRelationshipModal {...defaultProps} onConfirm={onConfirm} />)

    await userEvent.click(
      screen.getByRole("button", { name: "Confirmar recusa" }),
    )

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("desabilita ações e mostra loading enquanto está submetendo", () => {
    render(<RejectRelationshipModal {...defaultProps} isSubmitting />)

    expect(screen.getByRole("button", { name: "Recusando..." })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()
  })
})
