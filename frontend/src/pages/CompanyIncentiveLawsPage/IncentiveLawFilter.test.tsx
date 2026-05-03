import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { IncentiveLawFilter } from "./IncentiveLawFilter"

describe("IncentiveLawFilter", () => {
  it("renderiza todos os chips de lei", () => {
    render(<IncentiveLawFilter selected="todas" onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Todas" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lei Rouanet" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lei do Esporte" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Funcriança" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Lei do Idoso" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "PRONAS/PCD" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "PRONON" })).toBeInTheDocument()
  })

  it("clicar num chip chama onChange com o id correto", async () => {
    const onChange = vi.fn()
    render(<IncentiveLawFilter selected="todas" onChange={onChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Lei Rouanet" }))
    expect(onChange).toHaveBeenCalledWith("rouanet")
  })

  it("chip selecionado tem estilo ativo (bg-vinculo-dark)", () => {
    render(<IncentiveLawFilter selected="rouanet" onChange={vi.fn()} />)
    const chip = screen.getByRole("button", { name: "Lei Rouanet" })
    expect(chip.className).toContain("bg-vinculo-dark")
  })

  it("chip não selecionado não tem estilo ativo", () => {
    render(<IncentiveLawFilter selected="todas" onChange={vi.fn()} />)
    const chip = screen.getByRole("button", { name: "Lei Rouanet" })
    expect(chip.className).not.toContain("bg-vinculo-dark")
  })

  it("mudar o select chama onChange com o id correto", async () => {
    const onChange = vi.fn()
    render(<IncentiveLawFilter selected="todas" onChange={onChange} />)
    await userEvent.selectOptions(screen.getByRole("combobox"), "esporte")
    expect(onChange).toHaveBeenCalledWith("esporte")
  })
})
