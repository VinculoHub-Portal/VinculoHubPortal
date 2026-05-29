import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import NatureOutlinedIcon from "@mui/icons-material/NatureOutlined"
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import { BaseButton } from "../../components/general/BaseButton"
import { TextArea } from "../../components/general/TextArea"
import { Input } from "../../components/general/Input"
import type { NpoInstitutionalData } from "../../api/npo"
import { buildBadges } from "./npoProfileDisplay"

interface ProfileHeaderCardProps {
  institutionalData: NpoInstitutionalData
  editable: boolean
  isEditing: boolean
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  onChange?: <K extends keyof NpoInstitutionalData>(field: K, value: NpoInstitutionalData[K]) => void
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Ambiental: <NatureOutlinedIcon fontSize="inherit" />,
  Social: <PeopleOutlinedIcon fontSize="inherit" />,
  Governança: <AccountBalanceOutlinedIcon fontSize="inherit" />,
  Médio: <ShieldOutlinedIcon fontSize="inherit" />,
  Pequeno: <ShieldOutlinedIcon fontSize="inherit" />,
  Grande: <ShieldOutlinedIcon fontSize="inherit" />,
}

export function ProfileHeaderCard({
  institutionalData,
  editable,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: ProfileHeaderCardProps) {
  const badges = buildBadges(institutionalData)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-vinculo-dark text-white text-2xl">
            {institutionalData.logoUrl ? (
              <img
                src={institutionalData.logoUrl}
                alt={institutionalData.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <DescriptionOutlinedIcon fontSize="inherit" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            {isEditing ? (
              <Input
                id="ong-name"
                label="Nome da Organização"
                value={institutionalData.name}
                onChange={(e) => onChange?.("name", e.target.value)}
              />
            ) : (
              <h1 className="text-xl font-bold text-vinculo-dark">{institutionalData.name}</h1>
            )}

            {badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 rounded-full bg-vinculo-dark px-3 py-1 text-xs font-semibold text-white"
                  >
                    {BADGE_ICONS[badge]}
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {editable && (
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
            value={institutionalData.description ?? ""}
            rows={4}
            onChange={(e) => onChange?.("description", e.target.value)}
          />
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">
            {institutionalData.description}
          </p>
        )}
      </div>
    </article>
  )
}
