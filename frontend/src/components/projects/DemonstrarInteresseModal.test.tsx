import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { DemonstrarInteresseModal } from "./DemonstrarInteresseModal"

describe("DemonstrarInteresseModal", () => {
  it("não renderiza quando open=false", () => {
    render(
      <DemonstrarInteresseModal
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />,
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renderiza título quando open", () => {
    render(
      <DemonstrarInteresseModal
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        loading={false}
      />,
    )
    expect(screen.getByText(/demonstrar interesse/i)).toBeInTheDocument()
  })

  it("clique em Cancelar chama onClose", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <DemonstrarInteresseModal
        open
        onClose={onClose}
        onConfirm={vi.fn()}
        loading={false}
      />,
    )
    await user.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("clique em Confirmar chama onConfirm", async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <DemonstrarInteresseModal
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
        loading={false}
      />,
    )
    await user.click(screen.getByRole("button", { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("loading desabilita ambos os botões", () => {
    render(
      <DemonstrarInteresseModal open onClose={vi.fn()} onConfirm={vi.fn()} loading />,
    )
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /confirmando/i })).toBeDisabled()
  })
})
