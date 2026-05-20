import { render, screen } from "@testing-library/react";
import AddIcon from "@mui/icons-material/Add";
import { describe, expect, it } from "vitest";
import { FlexibleButton } from "./FlexibleButton";

describe("FlexibleButton", () => {
  it("renderiza um botão independente com ícone obrigatório", () => {
    render(
      <FlexibleButton icon={<AddIcon data-testid="flexible-button-icon" />}>
        Novo item
      </FlexibleButton>,
    )

    const button = screen.getByRole("button", { name: "Novo item" })

    expect(button).toHaveAttribute("type", "button")
    expect(button).toHaveClass("inline-flex")
    expect(button).toHaveClass("items-center")
    expect(button).toHaveClass("justify-center")
    expect(button).toHaveClass("gap-2")
    expect(button).toHaveClass("rounded-full")
    expect(button).toHaveClass("border-2")
    expect(button).toHaveClass("px-4")
    expect(button).toHaveClass("py-2")
    expect(button).toHaveClass("text-sm")
    expect(button).toHaveClass("leading-5")
    expect(screen.getByTestId("flexible-button-icon")).toHaveClass("h-4")
    expect(screen.getByTestId("flexible-button-icon")).toHaveClass("w-4")
  })

  it("aplica a variante visual padrão", () => {
    render(
      <FlexibleButton
        icon={<AddIcon data-testid="flexible-button-icon" />}
        variant="outline"
      >
        Novo item
      </FlexibleButton>,
    )

    const button = screen.getByRole("button", { name: "Novo item" })

    expect(button).toHaveClass("bg-white")
    expect(button).toHaveClass("text-vinculo-dark")
    expect(button).toHaveClass("border-vinculo-dark")
  })
})
