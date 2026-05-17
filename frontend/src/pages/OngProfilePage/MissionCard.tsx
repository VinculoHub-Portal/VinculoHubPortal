import { TextArea } from "../../components/general/TextArea"
import type { NpoProfile } from "./npoProfileMockData"

interface MissionCardProps {
  mission: NpoProfile["mission"]
  isEditing: boolean
  onChange?: (value: string) => void
}

export function MissionCard({ mission, isEditing, onChange }: MissionCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-base font-semibold text-vinculo-dark">
        Missão e Compromisso Social
      </h2>

      {isEditing ? (
        <TextArea
          id="ong-mission"
          label="Missão e Compromisso Social"
          value={mission}
          rows={5}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <p className="text-sm leading-relaxed text-slate-600">{mission}</p>
      )}
    </article>
  )
}
