import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { RelationshipListItem } from "../../../api/relationships"
import { RelationshipCard } from "./RelationshipCard"

const pendingRelationship: RelationshipListItem = {
  projectId: 1,
  projectName: "Projeto Dev",
  partnerInstitutionId: 2,
  partnerInstitutionName: "Empresa Dev S.A.",
  status: "pending",
  partnerContactEmail: null,
  partnerContactPhone: null,
  canRespond: true,
  canConfirm: false,
}

const defaultProps = {
  relationship: pendingRelationship,
  onAccept: vi.fn(),
  onReject: vi.fn(),
}

describe("RelationshipCard", () => {
  it("renderiza projeto, instituição parceira e status", () => {
    render(<RelationshipCard {...defaultProps} />)

    expect(screen.getByText("Projeto Dev")).toBeInTheDocument()
    expect(screen.getByText("Empresa Dev S.A.")).toBeInTheDocument()
    expect(screen.getByText("Pendente")).toBeInTheDocument()
  })

  it("renderiza email e telefone quando disponíveis", () => {
    const relationship = {
      ...pendingRelationship,
      partnerContactEmail: "contato@empresa.dev",
      partnerContactPhone: "(51) 99999-9999",
    }

    render(<RelationshipCard {...defaultProps} relationship={relationship} />)

    expect(screen.getByText("contato@empresa.dev")).toHaveAttribute(
      "href",
      "mailto:contato@empresa.dev",
    )
    expect(screen.getByText("(51) 99999-9999")).toHaveAttribute(
      "href",
      "tel:(51) 99999-9999",
    )
  })

  it("não renderiza seção de contato quando email e telefone são nulos", () => {
    render(<RelationshipCard {...defaultProps} />)

    expect(
      screen.queryByLabelText("Contato da instituição parceira"),
    ).not.toBeInTheDocument()
  })

  it("mostra ações somente para relacionamento pendente que pode responder", () => {
    render(<RelationshipCard {...defaultProps} />)

    expect(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Recusar" })).toBeInTheDocument()
  })

  it("não mostra ações para relacionamento pendente que não pode responder", () => {
    render(
      <RelationshipCard
        {...defaultProps}
        relationship={{ ...pendingRelationship, canRespond: false }}
      />,
    )

    expect(
      screen.queryByRole("button", { name: "Aceitar Contato" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Recusar" }),
    ).not.toBeInTheDocument()
  })

  it.each(["negotiation", "active"] as const)(
    "não mostra ações para relacionamento %s",
    (status) => {
      render(
        <RelationshipCard
          {...defaultProps}
          relationship={{ ...pendingRelationship, status }}
        />,
      )

      expect(
        screen.queryByRole("button", { name: "Aceitar Contato" }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole("button", { name: "Recusar" }),
      ).not.toBeInTheDocument()
    },
  )

  it("chama onAccept com o relacionamento", async () => {
    const onAccept = vi.fn()
    render(<RelationshipCard {...defaultProps} onAccept={onAccept} />)

    await userEvent.click(screen.getByRole("button", { name: "Aceitar Contato" }))

    expect(onAccept).toHaveBeenCalledWith(pendingRelationship)
  })

  it("chama onReject com o relacionamento", async () => {
    const onReject = vi.fn()
    render(<RelationshipCard {...defaultProps} onReject={onReject} />)

    await userEvent.click(screen.getByRole("button", { name: "Recusar" }))

    expect(onReject).toHaveBeenCalledWith(pendingRelationship)
  })

  it("desabilita ações enquanto está submetendo", () => {
    render(<RelationshipCard {...defaultProps} isSubmitting />)

    expect(
      screen.getByRole("button", { name: "Aceitar Contato" }),
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "Recusar" })).toBeDisabled()
  })

  it.each([
    ["negotiation", "Em negociação"],
    ["active", "Ativo"],
  ] as const)("renderiza o status %s como %s", (status, label) => {
    render(
      <RelationshipCard
        {...defaultProps}
        relationship={{ ...pendingRelationship, status }}
      />,
    )

    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
