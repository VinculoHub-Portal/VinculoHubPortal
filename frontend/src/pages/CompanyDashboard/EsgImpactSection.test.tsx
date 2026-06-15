import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import type { SvgIconComponent } from "@mui/icons-material"
import { EsgImpactSection } from "./EsgImpactSection"
import type { EsgPillar } from "./types"

const mockIcon = (() => <svg data-testid="mock-icon" />) as unknown as SvgIconComponent

const mockPillars: EsgPillar[] = [
  { label: "Ambiental", projects: 3, percentageOfTotal: 45, Icon: mockIcon, iconBgClass: "bg-blue-50", iconColorClass: "text-blue-500", barColorClass: "bg-blue-500" },
  { label: "Social", projects: 4, percentageOfTotal: 35, Icon: mockIcon, iconBgClass: "bg-green-50", iconColorClass: "text-green-500", barColorClass: "bg-green-500" },
  { label: "Governança", projects: 2, percentageOfTotal: 20, Icon: mockIcon, iconBgClass: "bg-amber-50", iconColorClass: "text-amber-500", barColorClass: "bg-amber-500" },
]

describe("EsgImpactSection", () => {
  it("renderiza o título 'Impacto ESG'", () => {
    render(<EsgImpactSection pillars={mockPillars} />)
    expect(screen.getByText("Impacto ESG")).toBeInTheDocument()
  })

  it("renderiza os 3 pilares com seus labels", () => {
    render(<EsgImpactSection pillars={mockPillars} />)
    expect(screen.getByText("Ambiental")).toBeInTheDocument()
    expect(screen.getByText("Social")).toBeInTheDocument()
    expect(screen.getByText("Governança")).toBeInTheDocument()
  })

  it("exibe contagens de projetos de cada pilar", () => {
    render(<EsgImpactSection pillars={mockPillars} />)
    expect(screen.getByText("3 projetos apoiados")).toBeInTheDocument()
    expect(screen.getByText("4 projetos apoiados")).toBeInTheDocument()
    expect(screen.getByText("2 projetos apoiados")).toBeInTheDocument()
  })

})
