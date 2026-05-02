import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { HowItWorksSection } from "./HowItWorksSection"

describe("HowItWorksSection", () => {
  it("renderiza o título da seção", () => {
    render(<HowItWorksSection />)
    expect(screen.getByText("Como funciona o Investimento Social Privado?")).toBeInTheDocument()
  })

  it("renderiza os 4 passos numerados", () => {
    render(<HowItWorksSection />)
    expect(screen.getByText("1. Escolha projetos alinhados")).toBeInTheDocument()
    expect(screen.getByText("2. Demonstre interesse")).toBeInTheDocument()
    expect(screen.getByText("3. Invista diretamente")).toBeInTheDocument()
    expect(screen.getByText("4. Acompanhe o impacto")).toBeInTheDocument()
  })
})
