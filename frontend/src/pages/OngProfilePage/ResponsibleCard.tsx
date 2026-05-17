import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import MailOutlinedIcon from "@mui/icons-material/MailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import { Input } from "../../components/general/Input"
import type { NpoProfile } from "./npoProfileMockData"

interface ResponsibleCardProps {
  responsible: NpoProfile["responsible"]
  isEditing: boolean
  onChange?: <K extends keyof NpoProfile["responsible"]>(
    field: K,
    value: NpoProfile["responsible"][K]
  ) => void
}

export function ResponsibleCard({ responsible, isEditing, onChange }: ResponsibleCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-base font-semibold text-vinculo-dark">
        Responsável pela Organização
      </h2>

      <div className="rounded-lg border border-slate-100 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-vinculo-dark text-white">
            <PersonOutlinedIcon fontSize="small" />
          </div>

          {isEditing ? (
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex-1">
                <Input
                  id="responsible-name"
                  label="Nome Completo"
                  value={responsible.name}
                  onChange={(e) => onChange?.("name", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  id="responsible-role"
                  label="Cargo"
                  value={responsible.role}
                  onChange={(e) => onChange?.("role", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{responsible.name}</p>
              <p className="text-sm text-slate-500">{responsible.role}</p>
            </div>
          )}

          {isEditing ? (
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex-1">
                <Input
                  id="responsible-email"
                  label="E-mail"
                  value={responsible.email}
                  icon={<MailOutlinedIcon fontSize="small" />}
                  onChange={(e) => onChange?.("email", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  id="responsible-phone"
                  label="Telefone"
                  value={responsible.phone}
                  icon={<PhoneOutlinedIcon fontSize="small" />}
                  onChange={(e) => onChange?.("phone", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 text-sm sm:items-end">
              <span className="inline-flex items-center gap-1 text-slate-600">
                <MailOutlinedIcon fontSize="inherit" />
                {responsible.email}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <PhoneOutlinedIcon fontSize="inherit" />
                {responsible.phone}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
