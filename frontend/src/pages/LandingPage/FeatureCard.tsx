import type { ReactNode } from "react"
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  items: string[]
  theme?: "ong" | "empresa"
}

export function FeatureCard({
  title,
  description,
  icon,
  items,
  theme = "ong",
}: FeatureCardProps) {
  const isGreen = theme === "ong"
  const iconBgColor = isGreen ? "bg-vinculo-green" : "bg-vinculo-dark"
  const checkColor = isGreen ? "text-vinculo-green" : "text-vinculo-dark"

  return (
    <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <span
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${iconBgColor}`}
        >
          {icon}
        </span>
        <span className="text-vinculo-dark text-xl sm:text-2xl md:text-3xl font-bold">
          {title}
        </span>
      </div>
      <span className="text-slate-600 text-sm sm:text-base mt-1 mb-2 sm:mb-4 ml-1">
        {description}
      </span>
      {items.map((item, index) => (
        <div key={index} className="flex flex-row items-start">
          <CheckOutlinedIcon
            className={`size-5 sm:size-6 font-bold mr-2 shrink-0 mt-0.5 ${checkColor}`}
          />
          <span className="text-slate-600 text-sm sm:text-base mb-1">{item}</span>
        </div>
      ))}
    </div>
  )
}
