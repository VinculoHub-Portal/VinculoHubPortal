import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import { useAuth0 } from "@auth0/auth0-react"
import { useCallback, useEffect, useState } from "react"
import {
  acceptRelationship,
  fetchRelationships,
  rejectRelationship,
  type RelationshipListItem,
  type RelationshipStatus,
} from "../../api/relationships"
import {
  fetchAuthenticatedProfile,
  type AuthenticatedProfile,
} from "../../api/me"
import { Header } from "../../components/general/Header"
import { useToast } from "../../context/ToastContext"
import { RejectRelationshipModal } from "./components/RejectRelationshipModal"
import { RelationshipCard } from "./components/RelationshipCard"

const STATUS_FILTERS: { status: RelationshipStatus; label: string }[] = [
  { status: "pending", label: "Pendentes" },
  { status: "negotiation", label: "Em negociação" },
  { status: "active", label: "Ativos" },
]

type AuthenticatedSession = {
  token: string
  profile: AuthenticatedProfile
}

function resolveCompanyId(
  profile: AuthenticatedProfile,
  relationship: RelationshipListItem,
): number | null {
  if (profile.userType === "company") return profile.companyId
  if (profile.userType === "npo") return relationship.partnerInstitutionId
  return null
}

export function RelationshipsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()
  const [selectedStatus, setSelectedStatus] =
    useState<RelationshipStatus>("pending")
  const [session, setSession] = useState<AuthenticatedSession | null>(null)
  const [relationships, setRelationships] = useState<RelationshipListItem[]>([])
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [relationshipToReject, setRelationshipToReject] =
    useState<RelationshipListItem | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      setIsLoadingSession(true)
      setLoadError(null)
      try {
        const token = await getAccessTokenSilently()
        const profile = await fetchAuthenticatedProfile(token)
        if (isActive) setSession({ token, profile })
      } catch {
        if (isActive) {
          setIsLoadingRelationships(false)
          setLoadError(
            "Não foi possível carregar seus relacionamentos. Tente novamente.",
          )
        }
      } finally {
        if (isActive) setIsLoadingSession(false)
      }
    }

    void loadSession()
    return () => {
      isActive = false
    }
  }, [getAccessTokenSilently])

  const loadRelationships = useCallback(async () => {
    if (!session) return

    setIsLoadingRelationships(true)
    setLoadError(null)
    try {
      const data = await fetchRelationships(
        { status: selectedStatus },
        session.token,
      )
      setRelationships(data)
    } catch {
      setLoadError(
        "Não foi possível carregar seus relacionamentos. Tente novamente.",
      )
    } finally {
      setIsLoadingRelationships(false)
    }
  }, [selectedStatus, session])

  useEffect(() => {
    if (!session) return

    let cancelled = false

    async function loadCurrentRelationships() {
      setIsLoadingRelationships(true)
      setLoadError(null)
      try {
        const data = await fetchRelationships(
          { status: selectedStatus },
          session.token,
        )
        if (!cancelled) setRelationships(data)
      } catch {
        if (!cancelled) {
          setLoadError(
            "Não foi possível carregar seus relacionamentos. Tente novamente.",
          )
        }
      } finally {
        if (!cancelled) setIsLoadingRelationships(false)
      }
    }

    void loadCurrentRelationships()

    return () => {
      cancelled = true
    }
  }, [selectedStatus, session])

  function getCompanyId(relationship: RelationshipListItem): number | null {
    if (!session) return null

    const companyId = resolveCompanyId(session.profile, relationship)
    if (companyId === null) {
      showToast(
        "Não foi possível identificar a empresa deste relacionamento.",
        "error",
      )
    }
    return companyId
  }

  async function handleAccept(relationship: RelationshipListItem) {
    if (!session) return
    const companyId = getCompanyId(relationship)
    if (companyId === null) return

    setIsSubmitting(true)
    try {
      await acceptRelationship(companyId, relationship.projectId, session.token)
      showToast("Contato aceito com sucesso.", "success")
      await loadRelationships()
    } catch {
      showToast("Não foi possível aceitar o contato. Tente novamente.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmReject() {
    if (!session || !relationshipToReject) return
    const companyId = getCompanyId(relationshipToReject)
    if (companyId === null) return

    setIsSubmitting(true)
    try {
      await rejectRelationship(
        companyId,
        relationshipToReject.projectId,
        session.token,
      )
      showToast("Contato recusado com sucesso.", "success")
      setRelationshipToReject(null)
      await loadRelationships()
    } catch {
      showToast("Não foi possível recusar o contato. Tente novamente.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isLoadingSession || isLoadingRelationships

  return (
    <div className="flex min-h-screen flex-col gap-10 bg-slate-50 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6">
        <header>
          <h1 className="text-2xl font-semibold leading-9 text-vinculo-dark">
            Relacionamentos
          </h1>
          <p className="mt-2 text-base leading-6 text-slate-500">
            Acompanhe e responda aos contatos entre projetos e instituições.
          </p>
        </header>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filtrar relacionamentos por status"
        >
          {STATUS_FILTERS.map(({ status, label }) => {
            const isSelected = selectedStatus === status
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={isSelected}
                disabled={isSubmitting}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "border-vinculo-dark bg-vinculo-dark text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => {
                  if (!isSelected) setIsLoadingRelationships(true)
                  setSelectedStatus(status)
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <section
            className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm"
            aria-live="polite"
          >
            <p className="text-sm font-medium text-slate-600">
              Carregando relacionamentos...
            </p>
          </section>
        ) : null}

        {!isLoading && loadError ? (
          <section
            className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm"
            role="alert"
          >
            <ErrorOutlineIcon fontSize="small" />
            <p className="text-sm font-medium">{loadError}</p>
          </section>
        ) : null}

        {!isLoading && !loadError && relationships.length === 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Inventory2OutlinedIcon className="text-slate-400" />
            <h2 className="mt-3 text-lg font-semibold text-vinculo-dark">
              Nenhum relacionamento encontrado
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Não há relacionamentos com o status selecionado.
            </p>
          </section>
        ) : null}

        {!isLoading && !loadError && relationships.length > 0 ? (
          <section
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            aria-label="Lista de relacionamentos"
          >
            {relationships.map((relationship) => (
              <RelationshipCard
                key={`${relationship.partnerInstitutionId}-${relationship.projectId}`}
                relationship={relationship}
                isSubmitting={isSubmitting}
                onAccept={handleAccept}
                onReject={setRelationshipToReject}
              />
            ))}
          </section>
        ) : null}
      </main>

      <RejectRelationshipModal
        open={relationshipToReject !== null}
        isSubmitting={isSubmitting}
        onCancel={() => setRelationshipToReject(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  )
}
