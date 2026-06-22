import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { EfetivarParceriaModal } from "./EfetivarParceriaModal"

const baseProps = {
  open: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  loading: false,
  projectName: "Projeto X",
  partnerName: "ACME",
}

describe("EfetivarParceriaModal", () => {
  it("renderiza título e nomes do projeto e parceiro", () => {
    render(<EfetivarParceriaModal {...baseProps} />)
    expect(screen.getByText(/efetivar parceria/i)).toBeInTheDocument()
    expect(screen.getByText(/Projeto X/)).toBeInTheDocument()
    expect(screen.getByText(/ACME/)).toBeInTheDocument()
  })

  it("clicar em Confirmar chama onConfirm", async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<EfetivarParceriaModal {...baseProps} onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("clicar em Cancelar chama onClose", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<EfetivarParceriaModal {...baseProps} onClose={onClose} />)
    await user.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("loading desabilita ambos os botões", () => {
    render(<EfetivarParceriaModal {...baseProps} loading />)
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /confirmando/i })).toBeDisabled()
  })
})
