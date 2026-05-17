import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { OrganizationInfoCard } from "./OrganizationInfoCard"
import type { NpoProfile } from "./npoProfileMockData"

const mockProfile: Pick<
  NpoProfile,
  | "cnpj"
  | "actionArea"
  | "organizationSize"
  | "foundationYear"
  | "annualBudget"
  | "address"
  | "email"
  | "phone"
  | "website"
> & NpoProfile = {
  slug: "test-ong",
  name: "ONG Teste",
  organizationType: "ONG I",
  badges: [],
  description: "",
  cnpj: "12.345.678/0001-90",
  actionArea: "Educação",
  organizationSize: "Médio",
  foundationYear: 2010,
  annualBudget: "R$ 2.500.000",
  address: "Av. Paulista, 1000",
  email: "contato@ong.org",
  phone: "(11) 3000-0000",
  website: "www.ong.org",
  responsible: { name: "", role: "", email: "", phone: "" },
  mission: "",
}

describe("OrganizationInfoCard — modo visualização", () => {
  it("exibe todos os labels de informações da organização", () => {
    render(<OrganizationInfoCard profile={mockProfile} isEditing={false} />)

    expect(screen.getByText("CNPJ")).toBeInTheDocument()
    expect(screen.getByText("Área de Atuação")).toBeInTheDocument()
    expect(screen.getByText("Porte da Organização")).toBeInTheDocument()
    expect(screen.getByText("Ano de Fundação")).toBeInTheDocument()
    expect(screen.getByText("Orçamento Anual para Projetos Sociais")).toBeInTheDocument()
  })

  it("exibe todos os labels de contato", () => {
    render(<OrganizationInfoCard profile={mockProfile} isEditing={false} />)

    expect(screen.getByText("Endereço")).toBeInTheDocument()
    expect(screen.getByText("E-mail")).toBeInTheDocument()
    expect(screen.getByText("Telefone")).toBeInTheDocument()
    expect(screen.getByText("Website")).toBeInTheDocument()
  })

  it("exibe os valores dos campos", () => {
    render(<OrganizationInfoCard profile={mockProfile} isEditing={false} />)

    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument()
    expect(screen.getByText("Av. Paulista, 1000")).toBeInTheDocument()
    expect(screen.getByText("contato@ong.org")).toBeInTheDocument()
    expect(screen.getByText("www.ong.org")).toBeInTheDocument()
  })
})

describe("OrganizationInfoCard — modo edição", () => {
  it("exibe inputs para todos os campos", () => {
    render(<OrganizationInfoCard profile={mockProfile} isEditing onChange={vi.fn()} />)

    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument()
    expect(screen.getByLabelText("Área de Atuação")).toBeInTheDocument()
    expect(screen.getByLabelText("Porte da Organização")).toBeInTheDocument()
    expect(screen.getByLabelText("Ano de Fundação")).toBeInTheDocument()
    expect(screen.getByLabelText("Orçamento Anual para Projetos Sociais")).toBeInTheDocument()
    expect(screen.getByLabelText("Endereço")).toBeInTheDocument()
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument()
    expect(screen.getByLabelText("Website")).toBeInTheDocument()
  })

  it("chama onChange com o campo correto ao editar o CNPJ", async () => {
    const onChange = vi.fn()
    render(<OrganizationInfoCard profile={mockProfile} isEditing onChange={onChange} />)

    const input = screen.getByLabelText("CNPJ")
    await userEvent.clear(input)
    await userEvent.type(input, "1")

    expect(onChange).toHaveBeenCalledWith("cnpj", expect.any(String))
  })
})
