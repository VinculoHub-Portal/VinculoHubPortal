import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import type { SvgIconComponent } from "@mui/icons-material"
import { EsgImpactSection } from "./EsgImpactSection"
import type { EsgPillar } from "./mockData"

const mockIcon = (() => <svg data-testid="mock-icon" />) as unknown as SvgIconComponent

const mockPillars: EsgPillar[] = [
  { label: "Ambiental", projects: 3, percentageOfTotal: 45, Icon: mockIcon, iconBgClass: "bg-blue-50", iconColorClass: "text-blue-500", barColorClass: "bg-blue-500" },
  { label: "Social", projects: 4, percentageOfTotal: 35, Icon: mockIcon, iconBgClass: "bg-green-50", iconColorClass: "text-green-500", barColorClass: "bg-green-500" },
  { label: "Governança", projects: 2, percentageOfTotal: 20, Icon: mockIcon, iconBgClass: "bg-amber-50", iconColorClass: "text-amber-500", barColorClass: "bg-amber-500" },
]

const mockFooter = { beneficiaries: "1.250", communities: 8, sdgs: 5, states: 3 }

describe("EsgImpactSection", () => {
  it("renderiza o título 'Impacto ESG'", () => {
    render(<EsgImpactSection pillars={mockPillars} footerStats={mockFooter} />)
    expect(screen.getByText("Impacto ESG")).toBeInTheDocument()
  })

  it("renderiza os 3 pilares com seus labels", () => {
    render(<EsgImpactSection pillars={mockPillars} footerStats={mockFooter} />)
    expect(screen.getByText("Ambiental")).toBeInTheDocument()
    expect(screen.getByText("Social")).toBeInTheDocument()
    expect(screen.getByText("Governança")).toBeInTheDocument()
  })

  it("exibe contagens de projetos de cada pilar", () => {
    render(<EsgImpactSection pillars={mockPillars} footerStats={mockFooter} />)
    expect(screen.getByText("3 projetos apoiados")).toBeInTheDocument()
    expect(screen.getByText("4 projetos apoiados")).toBeInTheDocument()
    expect(screen.getByText("2 projetos apoiados")).toBeInTheDocument()
  })

  it("renderiza os 4 stats do rodapé", () => {
    render(<EsgImpactSection pillars={mockPillars} footerStats={mockFooter} />)
    expect(screen.getByText("1.250")).toBeInTheDocument()
    expect(screen.getByText("Pessoas beneficiadas")).toBeInTheDocument()
    expect(screen.getByText("8")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })
})
