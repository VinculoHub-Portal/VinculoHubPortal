import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import PeopleIcon from "@mui/icons-material/People"
import PublicIcon from "@mui/icons-material/Public"
import { describe, expect, it } from "vitest"
import type { CompanyEsgImpactDashboardResponse } from "../../api/companyPortfolio"
import { mapEsgImpactDashboardToPillars } from "./esgImpactMapper"

describe("mapEsgImpactDashboardToPillars", () => {
  it("mapeia os campos de contrato backend para o modelo visual", () => {
    const dashboard: CompanyEsgImpactDashboardResponse = {
      projectCount: 3,
      totalInvested: 1000,
      totalBudgetNeeded: 2000,
      pillars: [
        {
          pillar: "ENVIRONMENTAL",
          label: "Ambiental",
          projectCount: 2,
          totalInvested: 600,
          budgetNeeded: 800,
          investmentPercentage: 60,
        },
        {
          pillar: "SOCIAL",
          label: "Social",
          projectCount: 1,
          totalInvested: 400,
          budgetNeeded: 1200,
          investmentPercentage: 40,
        },
        {
          pillar: "GOVERNANCE",
          label: "Governança",
          projectCount: 0,
          totalInvested: 0,
          budgetNeeded: 0,
          investmentPercentage: 0,
        },
      ],
    }

    const result = mapEsgImpactDashboardToPillars(dashboard)

    expect(result).toEqual([
      {
        label: "Ambiental",
        projects: 2,
        percentageOfTotal: 60,
        Icon: PublicIcon,
        iconBgClass: "bg-blue-50",
        iconColorClass: "text-blue-500",
        barColorClass: "bg-vinculo-dark",
      },
      {
        label: "Social",
        projects: 1,
        percentageOfTotal: 40,
        Icon: PeopleIcon,
        iconBgClass: "bg-green-50",
        iconColorClass: "text-vinculo-green",
        barColorClass: "bg-vinculo-green",
      },
      {
        label: "Governança",
        projects: 0,
        percentageOfTotal: 0,
        Icon: EmojiEventsIcon,
        iconBgClass: "bg-amber-50",
        iconColorClass: "text-amber-500",
        barColorClass: "bg-red-700",
      },
    ])
  })

  it("mapeia pilares zerados sem erro", () => {
    const dashboard: CompanyEsgImpactDashboardResponse = {
      projectCount: 0,
      totalInvested: 0,
      totalBudgetNeeded: 0,
      pillars: [
        {
          pillar: "ENVIRONMENTAL",
          label: "Ambiental",
          projectCount: 0,
          totalInvested: 0,
          budgetNeeded: 0,
          investmentPercentage: 0,
        },
        {
          pillar: "SOCIAL",
          label: "Social",
          projectCount: 0,
          totalInvested: 0,
          budgetNeeded: 0,
          investmentPercentage: 0,
        },
        {
          pillar: "GOVERNANCE",
          label: "Governança",
          projectCount: 0,
          totalInvested: 0,
          budgetNeeded: 0,
          investmentPercentage: 0,
        },
      ],
    }

    const result = mapEsgImpactDashboardToPillars(dashboard)

    expect(result).toHaveLength(3)
    expect(result.every((pillar) => pillar.projects === 0)).toBe(true)
    expect(result.every((pillar) => pillar.percentageOfTotal === 0)).toBe(true)
    expect(result.map((pillar) => pillar.label)).toEqual([
      "Ambiental",
      "Social",
      "Governança",
    ])
  })
})
