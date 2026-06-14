import { useAuth0 } from "@auth0/auth0-react"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import TaskAltIcon from "@mui/icons-material/TaskAlt"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  efetivarParceria,
  fetchMeVinculos,
  type VinculoResponse,
} from "../../api/vinculos"
import { BackLink } from "../../components/general/BackLink"
import { Header } from "../../components/general/Header"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  negotiation: "Em Negociação",
  active: "Ativo",
  inactive: "Inativo",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  negotiation: "bg-amber-50 text-amber-700 border border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  inactive: "bg-red-50 text-red-600 border border-red-200",
}

type VinculosPageProps = {
  role: "COMPANY" | "NPO"
  dashboardPath: string
}

export function VinculosPage({ role, dashboardPath }: VinculosPageProps) {
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  const [actionMessages, setActionMessages] = useState<Record<string, string>>({})
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({})

  const { data: vinculos = [], isLoading, isError } = useQuery({
    queryKey: ["vinculos", "me"],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return fetchMeVinculos(token)
    },
  })

  const mutation = useMutation({
    mutationFn: async ({ companyId, projectId }: { companyId: number; projectId: number }) => {
      const token = await getAccessTokenSilently()
      return efetivarParceria(companyId, projectId, token)
    },
    onSuccess: (data) => {
      const key = `${data.companyId}-${data.projectId}`
      setActionMessages((prev) => ({ ...prev, [key]: data.message }))
      setActionErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      void queryClient.invalidateQueries({ queryKey: ["vinculos", "me"] })
    },
    onError: (_error, variables) => {
      const key = `${variables.companyId}-${variables.projectId}`
      setActionErrors((prev) => ({
        ...prev,
        [key]: "Não foi possível confirmar a efetivação. Tente novamente.",
      }))
    },
  })

  const negotiationVinculos = vinculos.filter((v) => v.status === "negotiation")
  const otherVinculos = vinculos.filter((v) => v.status !== "negotiation")

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 sm:px-6">
        <BackLink label="Voltar ao Dashboard" onClick={() => navigate(dashboardPath)} />

        <header>
          <h1 className="text-2xl font-semibold leading-9 text-vinculo-dark">
            Meus Vínculos
          </h1>
          <p className="mt-2 text-base leading-6 text-slate-500">
            {role === "COMPANY"
              ? "Acompanhe suas parcerias com ONGs e efetive as negociações concluídas."
              : "Acompanhe as parcerias dos seus projetos e confirme as efetivações pendentes."}
          </p>
        </header>

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">Carregando vínculos...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">
              Não foi possível carregar os vínculos. Verifique sua conexão e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && vinculos.length === 0 && (
          <EmptyState role={role} />
        )}

        {!isLoading && !isError && negotiationVinculos.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-vinculo-dark">
              Aguardando Efetivação
            </h2>
            {negotiationVinculos.map((v) => {
              const key = `${v.companyId}-${v.projectId}`
              return (
                <VinculoCard
                  key={key}
                  vinculo={v}
                  role={role}
                  isLoading={mutation.isPending && mutation.variables?.companyId === v.companyId && mutation.variables?.projectId === v.projectId}
                  successMessage={actionMessages[key]}
                  errorMessage={actionErrors[key]}
                  onEfetivar={() =>
                    mutation.mutate({
                      companyId: v.companyId,
                      projectId: v.projectId,
                    })
                  }
                />
              )
            })}
          </section>
        )}

        {!isLoading && !isError && otherVinculos.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-vinculo-dark">
              Outros Vínculos
            </h2>
            {otherVinculos.map((v) => {
              const key = `${v.companyId}-${v.projectId}`
              return (
                <VinculoCard
                  key={key}
                  vinculo={v}
                  role={role}
                  isLoading={false}
                  successMessage={actionMessages[key]}
                  errorMessage={actionErrors[key]}
                />
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}

interface VinculoCardProps {
  vinculo: VinculoResponse
  role: "COMPANY" | "NPO"
  isLoading: boolean
  successMessage?: string
  errorMessage?: string
  onEfetivar?: () => void
}

function VinculoCard({
  vinculo,
  role,
  isLoading,
  successMessage,
  errorMessage,
  onEfetivar,
}: VinculoCardProps) {
  const partnerLabel = role === "COMPANY" ? "ONG" : "Empresa"
  const partnerName = role === "COMPANY" ? vinculo.npoName : vinculo.companyName
  const canEfetivar =
    vinculo.status === "negotiation" && !vinculo.currentUserConfirmed && !!onEfetivar
  const alreadyConfirmed = vinculo.status === "negotiation" && vinculo.currentUserConfirmed

  const companyConfirmedLabel = vinculo.companyConfirmed ? "✓ Empresa confirmou" : "○ Empresa pendente"
  const npoConfirmedLabel = vinculo.npoConfirmed ? "✓ ONG confirmou" : "○ ONG pendente"

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[vinculo.status] ?? "bg-slate-100 text-slate-600"}`}
            >
              {STATUS_LABEL[vinculo.status] ?? vinculo.status}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-vinculo-dark">
            {vinculo.projectTitle}
          </h3>
          <p className="text-sm text-slate-500">
            {partnerLabel}: <span className="font-medium text-slate-700">{partnerName}</span>
          </p>
        </div>

        {vinculo.status === "negotiation" && (
          <div className="flex flex-col items-end gap-2 shrink-0">
            {canEfetivar && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onEfetivar}
                className="inline-flex items-center gap-1.5 rounded-full bg-vinculo-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HandshakeOutlinedIcon sx={{ fontSize: 16 }} aria-hidden />
                {isLoading ? "Confirmando..." : "Efetivar Parceria"}
              </button>
            )}
            {alreadyConfirmed && !successMessage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <CheckCircleOutlineIcon sx={{ fontSize: 14 }} aria-hidden />
                Você já confirmou
              </span>
            )}
          </div>
        )}

        {vinculo.status === "active" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 shrink-0">
            <TaskAltIcon sx={{ fontSize: 14 }} aria-hidden />
            Ativo
          </span>
        )}
      </div>

      {vinculo.status === "negotiation" && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3">
          <ConfirmationBadge confirmed={vinculo.companyConfirmed} label={companyConfirmedLabel} />
          <ConfirmationBadge confirmed={vinculo.npoConfirmed} label={npoConfirmedLabel} />
        </div>
      )}

      {successMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5">
          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} className="text-emerald-600" aria-hidden />
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && !successMessage && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      {vinculo.status === "negotiation" && !vinculo.companyConfirmed && !vinculo.npoConfirmed && !successMessage && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <HourglassEmptyIcon sx={{ fontSize: 14 }} aria-hidden />
          <span>Aguardando confirmação de ambas as partes para ativar o vínculo.</span>
        </div>
      )}
    </article>
  )
}

function ConfirmationBadge({ confirmed, label }: { confirmed: boolean; label: string }) {
  return (
    <span
      className={`text-xs font-medium ${confirmed ? "text-emerald-600" : "text-slate-400"}`}
    >
      {label}
    </span>
  )
}

function EmptyState({ role }: { role: "COMPANY" | "NPO" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <HandshakeOutlinedIcon sx={{ fontSize: 40 }} className="text-slate-300" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold text-vinculo-dark">Nenhum vínculo encontrado</h2>
      <p className="mt-2 text-sm text-slate-500">
        {role === "COMPANY"
          ? "Sua empresa ainda não possui vínculos com ONGs. Navegue pelos projetos para iniciar uma parceria."
          : "Seus projetos ainda não possuem vínculos com empresas."}
      </p>
    </div>
  )
}
