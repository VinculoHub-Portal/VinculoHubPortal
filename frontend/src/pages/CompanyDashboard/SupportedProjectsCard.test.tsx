import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { SupportedProjectsCard } from "./SupportedProjectsCard"

const mockData = { active: 5, incentiveLaws: 3, privateInvestment: 2 }

function renderCard(props: Parameters<typeof SupportedProjectsCard>[0]) {
  return render(
    <MemoryRouter>
      <SupportedProjectsCard {...props} />
    </MemoryRouter>,
  )
}

describe("SupportedProjectsCard", () => {
  it("exibe os 3 valores de stats", () => {
    renderCard({ data: mockData })
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("exibe os labels dos stats", () => {
    renderCard({ data: mockData })
    expect(screen.getByText("Projetos ativos")).toBeInTheDocument()
    expect(screen.getByText("Leis de incentivo")).toBeInTheDocument()
    expect(screen.getByText("Investimento privado")).toBeInTheDocument()
  })

  it("link 'Ver todos os projetos' aponta para /meus-vinculos com filtro active", () => {
    renderCard({ data: mockData })
    const link = screen.getByRole("link", { name: /ver todos os projetos/i })
    expect(link).toHaveAttribute("href", "/meus-vinculos?filter=active")
  })

  it("exibe estado de carregamento sem depender dos mocks", () => {
    renderCard({ data: mockData, loading: true })
    expect(screen.getAllByText("...")).toHaveLength(3)
  })

  it("exibe mensagem amigável quando a integração falha", () => {
    renderCard({ data: mockData, error: "Falha na rede" })
    expect(
      screen.getByText("Não foi possível carregar os dados atualizados."),
    ).toBeInTheDocument()
  })
})
