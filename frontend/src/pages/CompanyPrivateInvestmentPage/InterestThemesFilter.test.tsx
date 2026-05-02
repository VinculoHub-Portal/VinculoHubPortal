import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InterestThemesFilter } from "./InterestThemesFilter"
import type { ThemeId } from "./mockData"

const emptyCounts = {
  educacao: 1, saude: 1, "meio-ambiente": 0, cultura: 0,
  esporte: 0, inclusao: 1, "desenvolvimento-comunitario": 1,
} as Record<ThemeId, number>

describe("InterestThemesFilter", () => {
  it("renderiza os 7 chips com contagem entre parênteses", () => {
    render(<InterestThemesFilter selected={new Set()} onToggle={vi.fn()} counts={emptyCounts} />)
    expect(screen.getByRole("button", { name: "Educação (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Meio Ambiente (0)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Desenvolvimento Comunitário (1)" })).toBeInTheDocument()
  })

  it("clicar num chip chama onToggle com o id correto", async () => {
    const onToggle = vi.fn()
    render(<InterestThemesFilter selected={new Set()} onToggle={onToggle} counts={emptyCounts} />)
    await userEvent.click(screen.getByRole("button", { name: "Saúde (1)" }))
    expect(onToggle).toHaveBeenCalledWith("saude")
  })

  it("chip presente no selected tem estilo ativo", () => {
    const selected = new Set<ThemeId>(["inclusao"])
    render(<InterestThemesFilter selected={selected} onToggle={vi.fn()} counts={emptyCounts} />)
    const chip = screen.getByRole("button", { name: "Inclusão (1)" })
    expect(chip.className).toContain("bg-vinculo-dark")
  })

  it("chip ausente do selected não tem estilo ativo", () => {
    render(<InterestThemesFilter selected={new Set()} onToggle={vi.fn()} counts={emptyCounts} />)
    const chip = screen.getByRole("button", { name: "Inclusão (1)" })
    expect(chip.className).not.toContain("bg-vinculo-dark")
  })
})
