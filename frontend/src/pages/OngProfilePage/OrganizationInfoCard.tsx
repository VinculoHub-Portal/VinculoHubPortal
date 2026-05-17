import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import EventOutlinedIcon from "@mui/icons-material/EventOutlined"
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import MailOutlinedIcon from "@mui/icons-material/MailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import { Input } from "../../components/general/Input"
import type { NpoProfile } from "./npoProfileMockData"

interface OrganizationInfoCardProps {
  profile: NpoProfile
  isEditing: boolean
  onChange?: <K extends keyof NpoProfile>(field: K, value: NpoProfile[K]) => void
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
  isEditing: boolean
  inputId: string
  onValueChange?: (value: string) => void
}

function InfoItem({ icon, label, value, isEditing, inputId, onValueChange }: InfoItemProps) {
  if (isEditing) {
    return (
      <div>
        <Input
          id={inputId}
          label={label}
          value={value}
          icon={icon}
          onChange={(e) => onValueChange?.(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export function OrganizationInfoCard({ profile, isEditing, onChange }: OrganizationInfoCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-5 text-base font-semibold text-vinculo-dark">
            Informações da Organização
          </h2>
          <div className="flex flex-col gap-4">
            <InfoItem
              icon={<DescriptionOutlinedIcon fontSize="small" />}
              label="CNPJ"
              value={profile.cnpj}
              isEditing={isEditing}
              inputId="ong-cnpj"
              onValueChange={(v) => onChange?.("cnpj", v)}
            />
            <InfoItem
              icon={<BusinessOutlinedIcon fontSize="small" />}
              label="Área de Atuação"
              value={profile.actionArea}
              isEditing={isEditing}
              inputId="ong-action-area"
              onValueChange={(v) => onChange?.("actionArea", v)}
            />
            <InfoItem
              icon={<ShieldOutlinedIcon fontSize="small" />}
              label="Porte da Organização"
              value={profile.organizationSize}
              isEditing={isEditing}
              inputId="ong-size"
              onValueChange={(v) => onChange?.("organizationSize", v)}
            />
            <InfoItem
              icon={<EventOutlinedIcon fontSize="small" />}
              label="Ano de Fundação"
              value={String(profile.foundationYear)}
              isEditing={isEditing}
              inputId="ong-foundation-year"
              onValueChange={(v) => onChange?.("foundationYear", Number(v))}
            />
            <InfoItem
              icon={<MonetizationOnOutlinedIcon fontSize="small" />}
              label="Orçamento Anual para Projetos Sociais"
              value={profile.annualBudget}
              isEditing={isEditing}
              inputId="ong-annual-budget"
              onValueChange={(v) => onChange?.("annualBudget", v)}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-5 text-base font-semibold text-vinculo-dark">Contato</h2>
          <div className="flex flex-col gap-4">
            <InfoItem
              icon={<LocationOnOutlinedIcon fontSize="small" />}
              label="Endereço"
              value={profile.address}
              isEditing={isEditing}
              inputId="ong-address"
              onValueChange={(v) => onChange?.("address", v)}
            />
            <InfoItem
              icon={<MailOutlinedIcon fontSize="small" />}
              label="E-mail"
              value={profile.email}
              isEditing={isEditing}
              inputId="ong-email"
              onValueChange={(v) => onChange?.("email", v)}
            />
            <InfoItem
              icon={<PhoneOutlinedIcon fontSize="small" />}
              label="Telefone"
              value={profile.phone}
              isEditing={isEditing}
              inputId="ong-phone"
              onValueChange={(v) => onChange?.("phone", v)}
            />
            <InfoItem
              icon={<LanguageOutlinedIcon fontSize="small" />}
              label="Website"
              value={profile.website}
              isEditing={isEditing}
              inputId="ong-website"
              onValueChange={(v) => onChange?.("website", v)}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
