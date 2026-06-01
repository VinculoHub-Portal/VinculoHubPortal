import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { OrganizationInfoCard } from "./OrganizationInfoCard"
import type { NpoAddressData, NpoContactData, NpoInstitutionalData } from "../../api/npo"

const mockInstitutionalData: NpoInstitutionalData = {
  id: 1,
  name: "ONG Teste",
  description: "",
  logoUrl: null,
  npoSize: "medium",
  cnpj: "12.345.678/0001-90",
  cpf: null,
  environmental: false,
  social: false,
  governance: false,
}

const mockContact: NpoContactData = {
  email: "contato@ong.org",
  phone: "(11) 3000-0000",
}

const mockAddress: NpoAddressData = {
  id: 1,
  state: "São Paulo",
  stateCode: "SP",
  city: "São Paulo",
  street: "Av. Paulista",
  number: "1000",
  complement: null,
  zipCode: "01310-100",
}

describe("OrganizationInfoCard — modo visualização", () => {
  it("exibe labels de informações da organização", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={false}
      />,
    )

    expect(screen.getByText("CNPJ")).toBeInTheDocument()
    expect(screen.getByText("Porte da Organização")).toBeInTheDocument()
  })

  it("exibe labels de contato", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={false}
      />,
    )

    expect(screen.getByText("Endereço")).toBeInTheDocument()
    expect(screen.getByText("E-mail")).toBeInTheDocument()
    expect(screen.getByText("Telefone")).toBeInTheDocument()
  })

  it("exibe os valores dos campos", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={false}
      />,
    )

    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument()
    expect(screen.getByText("contato@ong.org")).toBeInTheDocument()
    expect(screen.getByText("(11) 3000-0000")).toBeInTheDocument()
  })

  it("exibe porte da organização com label correto", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={false}
      />,
    )

    expect(screen.getByText("Médio")).toBeInTheDocument()
  })

  it("formata o endereço estruturado corretamente", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={false}
      />,
    )

    expect(screen.getByText(/Av\. Paulista, 1000/)).toBeInTheDocument()
  })
})

describe("OrganizationInfoCard — modo edição", () => {
  it("exibe inputs de contato em modo edição", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={true}
        onContactChange={vi.fn()}
        onAddressChange={vi.fn()}
      />,
    )

    expect(screen.getByText("E-mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument()
  })

  it("exibe inputs de endereço em modo edição", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={true}
        onContactChange={vi.fn()}
        onAddressChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText("Rua")).toBeInTheDocument()
    expect(screen.getByLabelText("Cidade")).toBeInTheDocument()
    expect(screen.getByLabelText("CEP")).toBeInTheDocument()
  })

  it("exibe e-mail como somente leitura em modo edição", () => {
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={true}
        onContactChange={vi.fn()}
        onAddressChange={vi.fn()}
      />,
    )

    expect(screen.getByText(mockContact.email)).toBeInTheDocument()
  })

  it("chama onAddressChange ao editar a rua", async () => {
    const onAddressChange = vi.fn()
    render(
      <OrganizationInfoCard
        institutionalData={mockInstitutionalData}
        contact={mockContact}
        address={mockAddress}
        isEditing={true}
        onContactChange={vi.fn()}
        onAddressChange={onAddressChange}
      />,
    )

    const input = screen.getByLabelText("Rua")
    await userEvent.clear(input)
    await userEvent.type(input, "A")

    expect(onAddressChange).toHaveBeenCalledWith("street", expect.any(String))
  })
})
