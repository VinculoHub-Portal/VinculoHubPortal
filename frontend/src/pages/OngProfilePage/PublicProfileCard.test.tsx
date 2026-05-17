import { act, render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PublicProfileCard } from "./PublicProfileCard"

const slug = "instituto-educacao"

describe("PublicProfileCard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("exibe o link público com o slug correto", () => {
    render(<PublicProfileCard slug={slug} />)

    const input = screen.getByLabelText<HTMLInputElement>("Link do perfil público")
    expect(input.value).toContain(`/ong/publico/${slug}`)
  })

  it("exibe o botão 'Copiar Link'", () => {
    render(<PublicProfileCard slug={slug} />)

    expect(screen.getByRole("button", { name: "Copiar Link" })).toBeInTheDocument()
  })

  it("chama clipboard.writeText com a URL correta ao clicar", async () => {
    render(<PublicProfileCard slug={slug} />)

    await userEvent.click(screen.getByRole("button", { name: "Copiar Link" }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(`/ong/publico/${slug}`),
    )
  })

  it("muda o label para 'Copiado!' após clicar", async () => {
    render(<PublicProfileCard slug={slug} />)

    await userEvent.click(screen.getByRole("button", { name: "Copiar Link" }))

    expect(screen.getByRole("button", { name: "Copiado!" })).toBeInTheDocument()
  })

  it("restaura o label 'Copiar Link' após o timeout", async () => {
    vi.useFakeTimers()
    render(<PublicProfileCard slug={slug} />)

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar Link" }))
    })
    expect(screen.getByRole("button", { name: "Copiado!" })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(screen.getByRole("button", { name: "Copiar Link" })).toBeInTheDocument()
  })

  it("não quebra se clipboard.writeText rejeitar", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"))
    render(<PublicProfileCard slug={slug} />)

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar Link" }))
    })

    // O label não muda para "Copiado!" porque o clipboard falhou
    expect(screen.getByRole("button", { name: "Copiar Link" })).toBeInTheDocument()
  })
})
