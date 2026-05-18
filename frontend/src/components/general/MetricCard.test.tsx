import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import PublicIcon from "@mui/icons-material/Public"
import { MetricCard } from "./MetricCard"

describe("MetricCard", () => {
  it("renderiza label, value, description e ícone", () => {
    render(
      <MetricCard
        label="Total de ONGs"
        value={87}
        description="Cadastradas no sistema"
        icon={<PublicIcon data-testid="metric-icon" />}
      />,
    )

    expect(screen.getByText("Total de ONGs")).toBeInTheDocument()
    expect(screen.getByText("87")).toBeInTheDocument()
    expect(screen.getByText("Cadastradas no sistema")).toBeInTheDocument()
    expect(screen.getByTestId("metric-icon")).toBeInTheDocument()
  })

  it("usa o variant brand por padrão", () => {
    render(
      <MetricCard
        label="Total de ONGs"
        value={87}
        description="Cadastradas no sistema"
        icon={<PublicIcon data-testid="metric-icon" />}
      />,
    )

    expect(screen.getByTestId("metric-card-icon")).toHaveClass("bg-vinculo-dark/10")
    expect(screen.getByTestId("metric-card-icon")).toHaveClass("text-vinculo-dark")
  })

  it.each([
    ["success", "bg-vinculo-green/15", "text-vinculo-green"],
    ["accent", "bg-violet-100", "text-violet-600"],
    ["warning", "bg-amber-100", "text-amber-600"],
  ] as const)("aplica classes do variant %s", (variant, bgClass, textClass) => {
    render(
      <MetricCard
        label="Métrica"
        value="24"
        description="Texto auxiliar"
        icon={<PublicIcon data-testid="metric-icon" />}
        variant={variant}
      />,
    )

    expect(screen.getByTestId("metric-card-icon")).toHaveClass(bgClass)
    expect(screen.getByTestId("metric-card-icon")).toHaveClass(textClass)
  })

  it("aceita value como string", () => {
    render(
      <MetricCard
        label="Investimento"
        value="R$ 250.000"
        description="Saldo disponível"
        icon={<PublicIcon data-testid="metric-icon" />}
        variant="success"
      />,
    )

    expect(screen.getByText("R$ 250.000")).toBeInTheDocument()
  })
})
