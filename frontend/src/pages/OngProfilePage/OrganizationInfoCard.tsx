import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import MailOutlinedIcon from "@mui/icons-material/MailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import { Input } from "../../components/general/Input"
import type { NpoContactData, NpoAddressData, NpoInstitutionalData } from "../../api/npo"
import { cnpjOrCpfLabel, formatAddress, npoSizeLabel } from "./npoProfileDisplay"

interface OrganizationInfoCardProps {
  institutionalData: NpoInstitutionalData
  contact: NpoContactData
  address: NpoAddressData | null
  isEditing: boolean
  onInstitutionalChange?: <K extends keyof NpoInstitutionalData>(
    field: K,
    value: NpoInstitutionalData[K],
  ) => void
  onContactChange?: <K extends keyof NpoContactData>(field: K, value: NpoContactData[K]) => void
  onAddressChange?: <K extends keyof NpoAddressData>(field: K, value: NpoAddressData[K]) => void
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

export function OrganizationInfoCard({
  institutionalData,
  contact,
  address,
  isEditing,
  onInstitutionalChange,
  onContactChange,
  onAddressChange,
}: OrganizationInfoCardProps) {
  const docField = cnpjOrCpfLabel(institutionalData.cnpj, institutionalData.cpf)
  const addressStr = formatAddress(address)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-5 text-base font-semibold text-vinculo-dark">
            Informações da Organização
          </h2>
          <div className="flex flex-col gap-4">
            {docField && (
              <InfoItem
                icon={<DescriptionOutlinedIcon fontSize="small" />}
                label={docField.label}
                value={docField.value}
                isEditing={isEditing}
                inputId="ong-cnpj"
                onValueChange={(v) =>
                  institutionalData.cnpj !== null
                    ? onInstitutionalChange?.("cnpj", v)
                    : onInstitutionalChange?.("cpf", v)
                }
              />
            )}
            {institutionalData.npoSize && (
              <InfoItem
                icon={<ShieldOutlinedIcon fontSize="small" />}
                label="Porte da Organização"
                value={npoSizeLabel(institutionalData.npoSize)}
                isEditing={false}
                inputId="ong-size"
              />
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-5 text-base font-semibold text-vinculo-dark">Contato</h2>
          <div className="flex flex-col gap-4">
            {isEditing ? (
              <>
                <Input
                  id="ong-address-street"
                  label="Rua"
                  value={address?.street ?? ""}
                  icon={<LocationOnOutlinedIcon fontSize="small" />}
                  onChange={(e) => onAddressChange?.("street", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="ong-address-number"
                    label="Número"
                    value={address?.number ?? ""}
                    onChange={(e) => onAddressChange?.("number", e.target.value)}
                  />
                  <Input
                    id="ong-address-complement"
                    label="Complemento"
                    value={address?.complement ?? ""}
                    onChange={(e) => onAddressChange?.("complement", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="ong-address-city"
                    label="Cidade"
                    value={address?.city ?? ""}
                    onChange={(e) => onAddressChange?.("city", e.target.value)}
                  />
                  <Input
                    id="ong-address-state-code"
                    label="Estado (UF)"
                    value={address?.stateCode ?? ""}
                    onChange={(e) => onAddressChange?.("stateCode", e.target.value)}
                  />
                </div>
                <Input
                  id="ong-address-zip"
                  label="CEP"
                  value={address?.zipCode ?? ""}
                  onChange={(e) => onAddressChange?.("zipCode", e.target.value)}
                />
              </>
            ) : (
              addressStr && (
                <InfoItem
                  icon={<LocationOnOutlinedIcon fontSize="small" />}
                  label="Endereço"
                  value={addressStr}
                  isEditing={false}
                  inputId="ong-address"
                />
              )
            )}
            <InfoItem
              icon={<MailOutlinedIcon fontSize="small" />}
              label="E-mail"
              value={contact.email ?? ""}
              isEditing={false}
              inputId="ong-email"
            />
            <InfoItem
              icon={<PhoneOutlinedIcon fontSize="small" />}
              label="Telefone"
              value={contact.phone ?? ""}
              isEditing={isEditing}
              inputId="ong-phone"
              onValueChange={(v) => onContactChange?.("phone", v)}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
