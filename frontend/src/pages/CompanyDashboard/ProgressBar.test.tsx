import React from "react"
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { ProgressBar } from "./ProgressBar"

function getBar(container: HTMLElement) {
  return container.querySelector("[style]") as HTMLElement
}

describe("ProgressBar", () => {
  it("define width de acordo com value", () => {
    const { container } = render(<ProgressBar value={60} />)
    expect(getBar(container).style.width).toBe("60%")
  })

  it("clamp: valor negativo vira 0%", () => {
    const { container } = render(<ProgressBar value={-20} />)
    expect(getBar(container).style.width).toBe("0%")
  })

  it("clamp: valor acima de 100 vira 100%", () => {
    const { container } = render(<ProgressBar value={150} />)
    expect(getBar(container).style.width).toBe("100%")
  })

  it("aplica colorClass na barra interna", () => {
    const { container } = render(<ProgressBar value={50} colorClass="bg-red-500" />)
    expect(getBar(container).className).toContain("bg-red-500")
  })

  it("aplica trackClass no container externo", () => {
    const { container } = render(<ProgressBar value={50} trackClass="bg-gray-100" />)
    expect(container.firstChild as HTMLElement).toHaveClass("bg-gray-100")
  })
})
