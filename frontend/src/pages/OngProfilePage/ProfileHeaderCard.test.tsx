import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import type { NpoInstitutionalData } from "../../api/npo"

const mockInstitutionalData: NpoInstitutionalData = {
  id: 1,
  name: "ONG Teste",
  description: "Descrição da organização de teste.",
  logoUrl: null,
  npoSize: "medium",
  cnpj: "00.000.000/0001-00",
  cpf: null,
  environmental: true,
  social: true,
  governance: false,
}

describe("ProfileHeaderCard — modo visualização", () => {
  it("exibe nome e descrição da ONG", () => {
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={false}
        isEditing={false}
      />,
    )

    expect(screen.getByText("ONG Teste")).toBeInTheDocument()
    expect(screen.getByText("Descrição da organização de teste.")).toBeInTheDocument()
  })

  it("exibe badges derivados de npoSize e flags ESG", () => {
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={false}
        isEditing={false}
      />,
    )

    expect(screen.getByText("Médio")).toBeInTheDocument()
    expect(screen.getByText("Ambiental")).toBeInTheDocument()
    expect(screen.getByText("Social")).toBeInTheDocument()
    expect(screen.queryByText("Governança")).not.toBeInTheDocument()
  })

  it("exibe botão 'Editar Perfil' quando editable=true", () => {
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={false}
        onEdit={vi.fn()}
      />,
    )

    expect(screen.getByText("Editar Perfil")).toBeInTheDocument()
  })

  it("não exibe botão 'Editar Perfil' quando editable=false", () => {
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={false}
        isEditing={false}
      />,
    )

    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument()
  })

  it("chama onEdit ao clicar em 'Editar Perfil'", async () => {
    const onEdit = vi.fn()
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={false}
        onEdit={onEdit}
      />,
    )

    await userEvent.click(screen.getByText("Editar Perfil"))

    expect(onEdit).toHaveBeenCalledOnce()
  })
})

describe("ProfileHeaderCard — modo edição", () => {
  it("exibe inputs para nome e descrição", () => {
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={true}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText("Nome da Organização")).toBeInTheDocument()
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument()
  })

  it("exibe botões 'Cancelar' e 'Salvar'", () => {
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={true}
        onCancel={vi.fn()}
        onSave={vi.fn()}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText("Cancelar")).toBeInTheDocument()
    expect(screen.getByText("Salvar")).toBeInTheDocument()
  })

  it("chama onChange ao digitar no input de nome", async () => {
    const onChange = vi.fn()
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={true}
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText("Nome da Organização")
    await userEvent.clear(input)
    await userEvent.type(input, "A")

    expect(onChange).toHaveBeenCalledWith("name", expect.any(String))
  })

  it("chama onCancel ao clicar em 'Cancelar'", async () => {
    const onCancel = vi.fn()
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={true}
        onCancel={onCancel}
        onSave={vi.fn()}
        onChange={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByText("Cancelar"))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("chama onSave ao clicar em 'Salvar'", async () => {
    const onSave = vi.fn()
    render(
      <ProfileHeaderCard
        institutionalData={mockInstitutionalData}
        editable={true}
        isEditing={true}
        onCancel={vi.fn()}
        onSave={onSave}
        onChange={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByText("Salvar"))

    expect(onSave).toHaveBeenCalledOnce()
  })
})
