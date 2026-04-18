import * as React from "react"

export function HeroIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="w-full h-auto"
      viewBox="0 0 500 350"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fill="#F6F3EC" d="M0 0H500V350H0z" />
      <circle cx={250} cy={175} r={80} fill="#6BAE75" opacity={0.7} />
      <circle cx={180} cy={120} r={60} fill="#00467F" opacity={0.6} />
      <circle cx={320} cy={220} r={70} fill="#F5C94C" opacity={0.6} />
      <g fill="none" stroke="#555" strokeWidth={2} strokeDasharray="5,5">
        <path d="M100 175q150-125 300 0M100 175q150 125 300 0" />
      </g>
      <g fill="#FFF" stroke="#00467F" strokeWidth={2}>
        <circle cx={100} cy={175} r={20} />
        <circle cx={250} cy={175} r={20} />
        <circle cx={400} cy={175} r={20} />
      </g>
    </svg>
  )
}

