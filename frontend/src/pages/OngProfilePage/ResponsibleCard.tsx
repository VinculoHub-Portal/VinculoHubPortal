import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import MailOutlinedIcon from "@mui/icons-material/MailOutlined"
import { Input } from "../../components/general/Input"
import type { NpoResponsibleData } from "../../api/npo"

interface ResponsibleCardProps {
  responsible: NpoResponsibleData | null
  isEditing: boolean
  onNameChange?: (value: string) => void
}

export function ResponsibleCard({
  responsible,
  isEditing,
  onNameChange,
}: ResponsibleCardProps) {
  if (!responsible) return null

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
                  value={responsible.name ?? ""}
                  onChange={(e) => onNameChange?.(e.target.value)}
                />
              </div>
              {responsible.email && (
                <div className="flex flex-1 flex-col gap-1 text-sm sm:items-end sm:justify-center">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <MailOutlinedIcon fontSize="inherit" />
                    {responsible.email}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{responsible.name || "Não informado"}</p>
              </div>
              <div className="flex flex-col gap-1 text-sm sm:items-end">
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <MailOutlinedIcon fontSize="inherit" />
                  {responsible.email ?? "Não informado"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
