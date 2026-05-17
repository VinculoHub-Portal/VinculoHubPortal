import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { MissionCard } from "./MissionCard"

const mission = "Nossa missão é promover impacto social positivo."

describe("MissionCard — modo visualização", () => {
  it("exibe o texto da missão", () => {
    render(<MissionCard mission={mission} isEditing={false} />)

    expect(screen.getByText(mission)).toBeInTheDocument()
  })

  it("não exibe textarea no modo visualização", () => {
    render(<MissionCard mission={mission} isEditing={false} />)

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })
})

describe("MissionCard — modo edição", () => {
  it("exibe textarea com o valor atual da missão", () => {
    render(<MissionCard mission={mission} isEditing onChange={vi.fn()} />)

    const textarea = screen.getByRole("textbox", { name: "Missão e Compromisso Social" })
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue(mission)
  })

  it("chama onChange ao digitar na textarea", async () => {
    const onChange = vi.fn()
    render(<MissionCard mission={mission} isEditing onChange={onChange} />)

    const textarea = screen.getByRole("textbox", { name: "Missão e Compromisso Social" })
    await userEvent.clear(textarea)
    await userEvent.type(textarea, "N")

    expect(onChange).toHaveBeenCalled()
  })
})
