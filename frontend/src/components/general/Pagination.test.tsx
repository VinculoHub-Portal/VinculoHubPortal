import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Pagination } from "./Pagination"

describe("Pagination", () => {
  it("não renderiza nada quando totalPages <= 1", () => {
    const { container } = render(<Pagination currentPage={0} totalPages={1} onChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("não renderiza nada quando totalPages é 0", () => {
    const { container } = render(<Pagination currentPage={0} totalPages={0} onChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renderiza 'Página 1 de 5' para currentPage=0, totalPages=5", () => {
    render(<Pagination currentPage={0} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByText("Página 1 de 5")).toBeInTheDocument()
  })

  it("renderiza 'Página 3 de 5' para currentPage=2, totalPages=5", () => {
    render(<Pagination currentPage={2} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByText("Página 3 de 5")).toBeInTheDocument()
  })

  it("botão Anterior está disabled na primeira página", () => {
    render(<Pagination currentPage={0} totalPages={3} onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /próxima/i })).not.toBeDisabled()
  })

  it("botão Próxima está disabled na última página", () => {
    render(<Pagination currentPage={2} totalPages={3} onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: /próxima/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /anterior/i })).not.toBeDisabled()
  })

  it("clicar Próxima chama onChange com currentPage + 1", () => {
    const onChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /próxima/i }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it("clicar Anterior chama onChange com currentPage - 1", () => {
    const onChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /anterior/i }))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
