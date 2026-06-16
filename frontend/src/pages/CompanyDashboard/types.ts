import type { SvgIconComponent } from "@mui/icons-material"

export interface InvestmentBudget {
  totalDisplay: string
  usedDisplay: string
  usedPercentage: number
}

export interface EsgPillar {
  label: string
  projects: number
  percentageOfTotal: number
  Icon: SvgIconComponent
  iconBgClass: string
  iconColorClass: string
  barColorClass: string
}
