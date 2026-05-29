import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ResponsibleCard } from "./ResponsibleCard"
import type { NpoResponsibleData } from "../../api/npo"

const mockResponsible: NpoResponsibleData = {
  id: 1,
  name: "Maria Silva",
  email: "maria@ong.org",
  auth0Id: "auth0|owner",
  userType: "npo",
}

describe("ResponsibleCard — modo visualização", () => {
  it("exibe nome do responsável", () => {
    render(<ResponsibleCard responsible={mockResponsible} isEditing={false} />)

    expect(screen.getByText("Maria Silva")).toBeInTheDocument()
  })

  it("exibe e-mail do responsável", () => {
    render(<ResponsibleCard responsible={mockResponsible} isEditing={false} />)

    expect(screen.getByText("maria@ong.org")).toBeInTheDocument()
  })

  it("não renderiza nada quando responsible é null", () => {
    const { container } = render(<ResponsibleCard responsible={null} isEditing={false} />)

    expect(container.firstChild).toBeNull()
  })
})

describe("ResponsibleCard — modo edição", () => {
  it("exibe inputs para nome e e-mail", () => {
    render(
      <ResponsibleCard
        responsible={mockResponsible}
        isEditing={true}
        onNameChange={vi.fn()}
        onEmailChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText("Nome Completo")).toBeInTheDocument()
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument()
  })

  it("chama onNameChange ao editar o nome", async () => {
    const onNameChange = vi.fn()
    render(
      <ResponsibleCard
        responsible={mockResponsible}
        isEditing={true}
        onNameChange={onNameChange}
        onEmailChange={vi.fn()}
      />,
    )

    const input = screen.getByLabelText("Nome Completo")
    await userEvent.clear(input)
    await userEvent.type(input, "A")

    expect(onNameChange).toHaveBeenCalled()
  })

  it("chama onEmailChange ao editar o e-mail", async () => {
    const onEmailChange = vi.fn()
    render(
      <ResponsibleCard
        responsible={mockResponsible}
        isEditing={true}
        onNameChange={vi.fn()}
        onEmailChange={onEmailChange}
      />,
    )

    const input = screen.getByLabelText("E-mail")
    await userEvent.clear(input)
    await userEvent.type(input, "a")

    expect(onEmailChange).toHaveBeenCalled()
  })
})
