import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ResponsibleCard } from "./ResponsibleCard"
import type { NpoProfile } from "./npoProfileMockData"

const mockResponsible: NpoProfile["responsible"] = {
  name: "Maria Silva",
  role: "Diretora Executiva",
  email: "maria@ong.org",
  phone: "(11) 3000-0001",
}

describe("ResponsibleCard — modo visualização", () => {
  it("exibe nome e cargo do responsável", () => {
    render(<ResponsibleCard responsible={mockResponsible} isEditing={false} />)

    expect(screen.getByText("Maria Silva")).toBeInTheDocument()
    expect(screen.getByText("Diretora Executiva")).toBeInTheDocument()
  })

  it("exibe e-mail e telefone do responsável", () => {
    render(<ResponsibleCard responsible={mockResponsible} isEditing={false} />)

    expect(screen.getByText("maria@ong.org")).toBeInTheDocument()
    expect(screen.getByText("(11) 3000-0001")).toBeInTheDocument()
  })
})

describe("ResponsibleCard — modo edição", () => {
  it("exibe inputs para todos os campos do responsável", () => {
    render(<ResponsibleCard responsible={mockResponsible} isEditing onChange={vi.fn()} />)

    expect(screen.getByLabelText("Nome Completo")).toBeInTheDocument()
    expect(screen.getByLabelText("Cargo")).toBeInTheDocument()
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument()
  })

  it("chama onChange com o campo correto ao editar o nome", async () => {
    const onChange = vi.fn()
    render(<ResponsibleCard responsible={mockResponsible} isEditing onChange={onChange} />)

    const input = screen.getByLabelText("Nome Completo")
    await userEvent.clear(input)
    await userEvent.type(input, "A")

    expect(onChange).toHaveBeenCalledWith("name", expect.any(String))
  })

  it("chama onChange com o campo correto ao editar o e-mail", async () => {
    const onChange = vi.fn()
    render(<ResponsibleCard responsible={mockResponsible} isEditing onChange={onChange} />)

    const input = screen.getByLabelText("E-mail")
    await userEvent.clear(input)
    await userEvent.type(input, "a")

    expect(onChange).toHaveBeenCalledWith("email", expect.any(String))
  })
})
