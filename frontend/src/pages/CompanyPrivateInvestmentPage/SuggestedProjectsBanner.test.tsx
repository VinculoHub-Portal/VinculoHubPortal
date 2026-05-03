import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { SuggestedProjectsBanner } from "./SuggestedProjectsBanner"

describe("SuggestedProjectsBanner", () => {
  it("usa singular quando projectCount=1", () => {
    render(<SuggestedProjectsBanner projectCount={1} />)
    expect(screen.getByText(/1 projeto que pode/)).toBeInTheDocument()
  })

  it("usa plural quando projectCount > 1", () => {
    render(<SuggestedProjectsBanner projectCount={3} />)
    expect(screen.getByText(/3 projetos que podem/)).toBeInTheDocument()
  })

  it("exibe os interesses mockados no texto", () => {
    render(<SuggestedProjectsBanner projectCount={2} />)
    expect(screen.getByText(/Educação, Meio Ambiente, Saúde/)).toBeInTheDocument()
  })

  it("renderiza o ícone de lâmpada e o título", () => {
    render(<SuggestedProjectsBanner projectCount={0} />)
    expect(screen.getByText(/Projetos Sugeridos/)).toBeInTheDocument()
  })
})
