import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import type { NpoProfile } from "./npoProfileMockData"

const mockProfile: NpoProfile = {
  slug: "test-ong",
  name: "ONG Teste",
  organizationType: "ONG I",
  badges: ["Educação", "Médio", "Fundada em 2010"],
  description: "Descrição da organização de teste.",
  cnpj: "00.000.000/0001-00",
  actionArea: "Educação",
  organizationSize: "Médio",
  foundationYear: 2010,
  annualBudget: "R$ 1.000.000",
  address: "Rua Teste, 123",
  email: "teste@ong.org",
  phone: "(11) 0000-0000",
  website: "www.ong-teste.org",
  responsible: {
    name: "João Silva",
    role: "Diretor",
    email: "joao@ong.org",
    phone: "(11) 0000-0001",
  },
  mission: "Nossa missão de teste.",
}

describe("ProfileHeaderCard — modo visualização", () => {
  it("exibe nome, tipo e descrição da ONG", () => {
    render(<ProfileHeaderCard profile={mockProfile} isEditing={false} />)

    expect(screen.getByText("ONG Teste")).toBeInTheDocument()
    expect(screen.getByText("(ONG I)")).toBeInTheDocument()
    expect(screen.getByText("Descrição da organização de teste.")).toBeInTheDocument()
  })

  it("exibe as badges corretamente", () => {
    render(<ProfileHeaderCard profile={mockProfile} isEditing={false} />)

    expect(screen.getByText("Educação")).toBeInTheDocument()
    expect(screen.getByText("Médio")).toBeInTheDocument()
    expect(screen.getByText("Fundada em 2010")).toBeInTheDocument()
  })

  it("exibe botão 'Editar Perfil'", () => {
    render(<ProfileHeaderCard profile={mockProfile} isEditing={false} onEdit={vi.fn()} />)

    expect(screen.getByText("Editar Perfil")).toBeInTheDocument()
  })

  it("não exibe botão 'Editar Perfil' quando hideEditButton=true", () => {
    render(<ProfileHeaderCard profile={mockProfile} isEditing={false} hideEditButton />)

    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument()
  })

  it("chama onEdit ao clicar em 'Editar Perfil'", async () => {
    const onEdit = vi.fn()
    render(<ProfileHeaderCard profile={mockProfile} isEditing={false} onEdit={onEdit} />)

    await userEvent.click(screen.getByText("Editar Perfil"))

    expect(onEdit).toHaveBeenCalledOnce()
  })
})

describe("ProfileHeaderCard — modo edição", () => {
  it("exibe inputs para nome e descrição", () => {
    render(<ProfileHeaderCard profile={mockProfile} isEditing onChange={vi.fn()} />)

    expect(screen.getByLabelText("Nome da Organização")).toBeInTheDocument()
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument()
  })

  it("exibe botões 'Cancelar' e 'Salvar'", () => {
    render(
      <ProfileHeaderCard
        profile={mockProfile}
        isEditing
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
    render(<ProfileHeaderCard profile={mockProfile} isEditing onChange={onChange} />)

    const input = screen.getByLabelText("Nome da Organização")
    await userEvent.clear(input)
    await userEvent.type(input, "A")

    expect(onChange).toHaveBeenCalledWith("name", expect.any(String))
  })

  it("chama onCancel ao clicar em 'Cancelar'", async () => {
    const onCancel = vi.fn()
    render(
      <ProfileHeaderCard
        profile={mockProfile}
        isEditing
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
        profile={mockProfile}
        isEditing
        onCancel={vi.fn()}
        onSave={onSave}
        onChange={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByText("Salvar"))

    expect(onSave).toHaveBeenCalledOnce()
  })
})
