import type { ReactNode } from "react";
import { Check } from "./Check";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  items: string[];
  theme?: "ong" | "empresa";
}

export function FeatureCard({
  title,
  description,
  icon,
  items,
  theme = "ong",
}: FeatureCardProps) {
  const isGreen = theme === "ong";
  const iconBgColor = isGreen ? "bg-vinculo-green" : "bg-vinculo-dark";
  const checkColor = isGreen ? "text-vinculo-green" : "text-vinculo-dark";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start gap-4">
      <div className="flex items-center">
        <span className={`w-15 h-15 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${iconBgColor}`}>
          {icon}
        </span>
        <span className="text-vinculo-dark text-[30px] ml-3 font-bold">{title}</span>
      </div>
      <div className="flex flex-row">
        <span className="text-slate-600 text-lg mb-7 ml-1 mt-3">{description}</span>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex flex-row items-start">
          <Check className={`size-6 font-bold mr-2 flex-shrink-0 mt-1 ${checkColor}`} />
          <span className="text-slate-600 text-lg mb-2">{item}</span>
        </div>
      ))}
    </div>
  );
}