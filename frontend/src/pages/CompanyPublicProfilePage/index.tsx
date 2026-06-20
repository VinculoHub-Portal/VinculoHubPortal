import { useAuth0 } from "@auth0/auth0-react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button, Tooltip } from "@mui/material"
import { fetchCompanyPublicProfile } from "../../api/companies"
import {
  createRelationship,
  fetchRelationships,
  type RelationshipListItem,
} from "../../api/relationships"
import { ProporParceriaModal } from "../../components/companies/ProporParceriaModal"
import { Header } from "../../components/general/Header"
import { useToast } from "../../context/ToastContext"
import { useOngProjects } from "../OngProjectsPage/useOngProjects"

const ROLES_CLAIM = "https://vinculohub/roles"

export function CompanyPublicProfilePage() {
  const { companyId = "" } = useParams<{ companyId: string }>()
  const { getAccessTokenSilently, user } = useAuth0()
  const numericId = Number(companyId)
  const validId = Number.isFinite(numericId) && numericId > 0 ? numericId : null

  const query = useQuery({
    queryKey: ["company-public-profile", validId],
    queryFn: async () => {
      if (validId === null) return null
      const token = await getAccessTokenSilently()
      return fetchCompanyPublicProfile(validId, token)
    },
    enabled: validId !== null,
  })

  const status =
    (query.error as { response?: { status?: number } } | null)?.response?.status ?? null
  const isNotFound =
    validId === null || status === 404 || (query.isSuccess && query.data == null)

  const isNpo = useMemo(() => {
    const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM]
    const roles = Array.isArray(rawRoles) ? rawRoles : []
    return roles.some((r) => String(r).toUpperCase() === "NPO")
  }, [user])

  const { projects } = useOngProjects()
  const [existingRelationships, setExistingRelationships] = useState<
    RelationshipListItem[]
  >([])

  useEffect(() => {
    if (!isNpo) return
    let cancelled = false
    void (async () => {
      try {
        const t = await getAccessTokenSilently()
        const items = await fetchRelationships({}, t)
        if (!cancelled) setExistingRelationships(items)
      } catch {
        if (!cancelled) setExistingRelationships([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isNpo, getAccessTokenSilently])

  const proposableProjects = useMemo(() => {
    if (!isNpo || validId === null) return []
    return projects
      .filter((p) => p.status === "Ativo")
      .filter(
        (p) =>
          !existingRelationships.some(
            (r) =>
              r.projectId === p.id &&
              r.partnerInstitutionId === validId &&
              r.status !== "inactive",
          ),
      )
      .map((p) => ({ id: p.id, title: p.title }))
  }, [isNpo, projects, existingRelationships, validId])

  const [proposeModalOpen, setProposeModalOpen] = useState(false)
  const [submittingPropose, setSubmittingPropose] = useState(false)
  const { showToast } = useToast()

  async function handleConfirmPropose(projectId: number) {
    if (!validId) return
    setSubmittingPropose(true)
    try {
      const t = await getAccessTokenSilently()
      await createRelationship(projectId, t, validId)
      setProposeModalOpen(false)
      showToast("Proposta enviada com sucesso!", "success")
    } catch {
      showToast("Não foi possível enviar a proposta. Tente novamente.", "error")
    } finally {
      setSubmittingPropose(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-3xl mx-auto w-full">
          {query.isLoading && (
            <p className="text-sm text-slate-500" role="status" aria-busy="true">
              Carregando perfil da empresa...
            </p>
          )}

          {!query.isLoading && isNotFound && (
            <article className="bg-white rounded-2xl border border-slate-200 px-6 py-12 text-center shadow-sm">
              <h1 className="text-lg font-semibold text-vinculo-dark">
                Empresa não encontrada
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                A empresa que você tentou acessar não existe ou não está mais disponível.
              </p>
            </article>
          )}

          {!query.isLoading && !isNotFound && query.isError && (
            <div
              className="bg-white rounded-2xl border border-slate-200 px-6 py-12 text-center shadow-sm"
              role="alert"
            >
              <p className="text-slate-700 mb-4">
                Não foi possível carregar os dados da empresa.
              </p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="inline-flex items-center justify-center rounded-lg bg-vinculo-dark px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!query.isLoading && !query.isError && query.data && (
            <article className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-6 sm:px-10 py-8 sm:py-10 border border-slate-100">
              <header className="flex items-center gap-4">
                {query.data.logoUrl && (
                  <img
                    src={query.data.logoUrl}
                    alt={`Logo de ${query.data.legalName}`}
                    className="h-16 w-16 rounded-full object-cover border border-slate-200"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-vinculo-dark">
                    {query.data.legalName}
                  </h1>
                  {query.data.socialName && (
                    <p className="text-sm text-slate-500">{query.data.socialName}</p>
                  )}
                </div>
              </header>

              {query.data.description && (
                <section className="mt-8">
                  <h2 className="text-base font-bold text-vinculo-dark mb-3">Sobre</h2>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {query.data.description}
                  </p>
                </section>
              )}

              {(query.data.city || query.data.stateCode) && (
                <section className="mt-6">
                  <h2 className="text-base font-bold text-vinculo-dark mb-3">Localização</h2>
                  <p className="text-slate-600 text-sm">
                    {[query.data.city, query.data.stateCode].filter(Boolean).join(" - ")}
                  </p>
                </section>
              )}

              {isNpo && (
                <section className="mt-8 flex justify-end">
                  <Tooltip
                    title={
                      proposableProjects.length === 0
                        ? "Você precisa de um projeto ativo para propor parceria"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        disabled={proposableProjects.length === 0}
                        onClick={() => setProposeModalOpen(true)}
                      >
                        Propor Parceria
                      </Button>
                    </span>
                  </Tooltip>
                </section>
              )}
            </article>
          )}

          {isNpo && query.data && (
            <ProporParceriaModal
              open={proposeModalOpen}
              onClose={() => setProposeModalOpen(false)}
              onConfirm={(pid) => void handleConfirmPropose(pid)}
              loading={submittingPropose}
              projects={proposableProjects}
              companyName={query.data.legalName}
            />
          )}
        </div>
      </main>
    </div>
  )
}
