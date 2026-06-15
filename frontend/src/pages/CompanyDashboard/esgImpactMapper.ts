import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import PeopleIcon from "@mui/icons-material/People"
import PublicIcon from "@mui/icons-material/Public"
import type {
  CompanyEsgImpactDashboardResponse,
  EsgPillarCode,
} from "../../api/companyPortfolio"
import type { EsgPillar } from "./types"

const ESG_PILLAR_VISUALS: Record<
  EsgPillarCode,
  Pick<EsgPillar, "Icon" | "iconBgClass" | "iconColorClass" | "barColorClass">
> = {
  ENVIRONMENTAL: {
    Icon: PublicIcon,
    iconBgClass: "bg-blue-50",
    iconColorClass: "text-blue-500",
    barColorClass: "bg-vinculo-dark",
  },
  SOCIAL: {
    Icon: PeopleIcon,
    iconBgClass: "bg-green-50",
    iconColorClass: "text-vinculo-green",
    barColorClass: "bg-vinculo-green",
  },
  GOVERNANCE: {
    Icon: EmojiEventsIcon,
    iconBgClass: "bg-amber-50",
    iconColorClass: "text-amber-500",
    barColorClass: "bg-red-700",
  },
}

export function mapEsgImpactDashboardToPillars(
  dashboard: CompanyEsgImpactDashboardResponse,
): EsgPillar[] {
  return dashboard.pillars.map((pillar) => ({
    label: pillar.label,
    projects: pillar.projectCount,
    percentageOfTotal: pillar.investmentPercentage,
    ...ESG_PILLAR_VISUALS[pillar.pillar],
  }))
}
