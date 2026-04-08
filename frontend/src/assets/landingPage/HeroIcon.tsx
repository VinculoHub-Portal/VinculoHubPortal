import * as React from "react"

export type HeroIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

function HeroIcon({ className, width, height, size, ...rest }: HeroIconProps) {
  const hasExplicitDimensions =
    width !== undefined || height !== undefined || size !== undefined
  const resolvedWidth = width ?? (size !== undefined ? size : undefined)
  const resolvedHeight = height ?? (size !== undefined ? size : undefined)

  const defaultFluidClass = "h-full w-full max-h-full max-w-full shrink-0"

  const mergedClassName = hasExplicitDimensions
    ? [className].filter(Boolean).join(" ")
    : [defaultFluidClass, className].filter(Boolean).join(" ")

  return (
    <svg
      viewBox="0 0 586 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={mergedClassName || undefined}
      width={hasExplicitDimensions ? resolvedWidth : undefined}
      height={hasExplicitDimensions ? resolvedHeight : undefined}
      {...rest}
    >
      <path
        d="M80 176c0-53.019 42.981-96 96-96s96 42.981 96 96-42.981 96-96 96-96-42.981-96-96z"
        fill="#51A2FF"
        opacity={0.6}
      />
      <path
        d="M160 216c0-53.019 42.981-96 96-96s96 42.981 96 96-42.981 96-96 96-96-42.981-96-96z"
        fill="#05DF72"
        opacity={0.6}
      />
      <path
        d="M120 256c0-53.019 42.981-96 96-96s96 42.981 96 96-42.981 96-96 96-96-42.981-96-96z"
        fill="#FFDF20"
        opacity={0.6}
      />
      <mask id="a" fill="#fff">
        <path d="M60 116c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16z" />
      </mask>
      <path
        d="M60 116c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16z"
        fill="#fff"
      />
      <path
        d="M76 132v-4c-6.627 0-12-5.373-12-12h-8c0 11.046 8.954 20 20 20v-4zm16-16h-4c0 6.627-5.373 12-12 12v8c11.046 0 20-8.954 20-20h-4zm-16-16v4c6.627 0 12 5.373 12 12h8c0-11.046-8.954-20-20-20v4zm0 0v-4c-11.046 0-20 8.954-20 20h8c0-6.627 5.373-12 12-12v-4z"
        fill="#00467F"
        mask="url(#a)"
      />
      <mask id="b" fill="#fff">
        <path d="M493.5 96c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16z" />
      </mask>
      <path
        d="M493.5 96c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16z"
        fill="#fff"
      />
      <path
        d="M509.5 112v-4c-6.627 0-12-5.373-12-12h-8c0 11.046 8.954 20 20 20v-4zm16-16h-4c0 6.627-5.373 12-12 12v8c11.046 0 20-8.954 20-20h-4zm-16-16v4c6.627 0 12 5.373 12 12h8c0-11.046-8.954-20-20-20v4zm0 0v-4c-11.046 0-20 8.954-20 20h8c0-6.627 5.373-12 12-12v-4z"
        fill="#00467F"
        mask="url(#b)"
      />
      <mask id="c" fill="#fff">
        <path d="M453.5 304c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16z" />
      </mask>
      <path
        d="M453.5 304c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16z"
        fill="#fff"
      />
      <path
        d="M469.5 320v-4c-6.627 0-12-5.373-12-12h-8c0 11.046 8.954 20 20 20v-4zm16-16h-4c0 6.627-5.373 12-12 12v8c11.046 0 20-8.954 20-20h-4zm-16-16v4c6.627 0 12 5.373 12 12h8c0-11.046-8.954-20-20-20v4zm0 0v-4c-11.046 0-20 8.954-20 20h8c0-6.627 5.373-12 12-12v-4z"
        fill="#00467F"
        mask="url(#c)"
      />
      <path
        d="M100 200c66.667-33.333 133.333-33.333 200 0"
        stroke="#00467F"
        strokeWidth={2}
        strokeDasharray="5 5"
      />
    </svg>
  )
}

export default HeroIcon
