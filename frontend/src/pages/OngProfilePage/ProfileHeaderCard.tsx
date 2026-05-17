import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import EventOutlinedIcon from "@mui/icons-material/EventOutlined"
import { BaseButton } from "../../components/general/BaseButton"
import { TextArea } from "../../components/general/TextArea"
import { Input } from "../../components/general/Input"
import type { NpoProfile } from "./npoProfileMockData"

interface ProfileHeaderCardProps {
  profile: NpoProfile
  isEditing: boolean
  hideEditButton?: boolean
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  onChange?: <K extends keyof NpoProfile>(field: K, value: NpoProfile[K]) => void
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Médio: <ShieldOutlinedIcon fontSize="inherit" />,
}

function BadgeIcon({ badge }: { badge: string }) {
  if (badge.startsWith("Fundada em")) {
    return <EventOutlinedIcon fontSize="inherit" />
  }
  if (BADGE_ICONS[badge]) {
    return BADGE_ICONS[badge]
  }
  return null
}

export function ProfileHeaderCard({
  profile,
  isEditing,
  hideEditButton = false,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: ProfileHeaderCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-vinculo-dark text-white text-2xl">
            <DescriptionOutlinedIcon fontSize="inherit" />
          </div>

          <div className="flex flex-col gap-1">
            {isEditing ? (
              <Input
                id="ong-name"
                label="Nome da Organização"
                value={profile.name}
                onChange={(e) => onChange?.("name", e.target.value)}
              />
            ) : (
              <h1 className="text-xl font-bold text-vinculo-dark">{profile.name}</h1>
            )}
            <span className="text-sm text-slate-500">({profile.organizationType})</span>

            <div className="mt-2 flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-full bg-vinculo-dark px-3 py-1 text-xs font-semibold text-white"
                >
                  <BadgeIcon badge={badge} />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {!hideEditButton && (
          <div className="flex shrink-0 items-center gap-2">
            {isEditing ? (
              <>
                <BaseButton variant="outline" onClick={onCancel}>
                  Cancelar
                </BaseButton>
                <BaseButton variant="secondary" onClick={onSave}>
                  Salvar
                </BaseButton>
              </>
            ) : (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 text-sm font-semibold text-vinculo-dark transition hover:opacity-70"
              >
                <EditOutlinedIcon fontSize="small" />
                Editar Perfil
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        {isEditing ? (
          <TextArea
            id="ong-description"
            label="Descrição"
            value={profile.description}
            rows={4}
            onChange={(e) => onChange?.("description", e.target.value)}
          />
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">{profile.description}</p>
        )}
      </div>
    </article>
  )
}
