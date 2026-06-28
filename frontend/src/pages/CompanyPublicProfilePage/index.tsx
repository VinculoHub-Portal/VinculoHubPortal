import { useAuth0 } from "@auth0/auth0-react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import { Tooltip } from "@mui/material"
import {
  fetchCompanyPublicProfile,
  type CompanyPublicProfile,
} from "../../api/companies"
import {
  createRelationship,
  fetchRelationships,
  type RelationshipListItem,
} from "../../api/relationships"
import { BaseButton } from "../../components/general/BaseButton"
import { Header } from "../../components/general/Header"
import { ProporParceriaModal } from "../../components/companies/ProporParceriaModal"
import { useToast } from "../../context/ToastContext"
import { resolveDashboardPath } from "../../utils/dashboardPath"
import { useOngProjects } from "../OngProjectsPage/useOngProjects"

const ROLES_CLAIM = "https://vinculohub/roles"

export function CompanyPublicProfilePage() {
  const { companyId = "" } = useParams<{ companyId: string }>()
  const { getAccessTokenSilently, user } = useAuth0()
  const numericId = Number(companyId)
  const validId = Number.isFinite(numericId) && numericId > 0 ? numericId : null
  const dashboardPath = resolveDashboardPath(user)

  const query = useQuery({
    queryKey: ["company-public-profile", validId],
    queryFn: async () => {
      if (validId === null) return null
      const token = await getAccessTokenSilently()
      return fetchCompanyPublicProfile(validId, token)
    },
    enabled: validId !== null,
  })

  const httpStatus =
    (query.error as { response?: { status?: number } } | null)?.response?.status ?? null
  const isNotFound =
    validId === null || httpStatus === 404 || (query.isSuccess && query.data == null)

  const isNpo = useMemo(() => {
    const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM]
    const roles = Array.isArray(rawRoles) ? rawRoles : []
    return roles.some((r) => String(r).toUpperCase() === "NPO")
  }, [user])

  const { projects } = useOngProjects()
  const [existingRelationships, setExistingRelationships] = useState<
    RelationshipListItem[]
  >([])
  const [sentProposal, setSentProposal] = useState(false)

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

  const [proposeModalOpen, setProposeModalOpen] = useState(false)
  const [submittingPropose, setSubmittingPropose] = useState(false)
  const { showToast } = useToast()

  const activeProjects = useMemo(() => {
    if (!isNpo) return []
    return projects.filter((p) => p.status === "Ativo")
  }, [isNpo, projects])

  const relationshipsWithCompany = useMemo(() => {
    if (validId === null) return []
    const activeProjectIds = new Set(activeProjects.map((p) => p.id))
    return existingRelationships.filter(
      (r) =>
        activeProjectIds.has(r.projectId) &&
        r.partnerInstitutionId === validId &&
        r.status !== "inactive",
    )
  }, [activeProjects, existingRelationships, validId])

  const proposableProjects = useMemo(() => {
    if (!isNpo || validId === null) return []
    return activeProjects
      .filter((p) => !relationshipsWithCompany.some((r) => r.projectId === p.id))
      .map((p) => ({ id: p.id, title: p.title }))
  }, [isNpo, activeProjects, relationshipsWithCompany, validId])

  const hasActiveProjects = activeProjects.length > 0
  const hasRespondableCompanyInterest = relationshipsWithCompany.some(
    (r) => r.status === "pending" && r.canRespond,
  )
  const hasPendingProposal =
    sentProposal ||
    relationshipsWithCompany.some((r) => r.status === "pending" && !r.canRespond)
  const hasRelationshipInProgress = relationshipsWithCompany.some(
    (r) => r.status === "active" || r.status === "negotiation",
  )
  const proposeDisabled = sentProposal || proposableProjects.length === 0
  const proposeButtonLabel =
    sentProposal || (proposableProjects.length === 0 && hasPendingProposal)
      ? "Proposta enviada"
      : proposeDisabled && hasRelationshipInProgress
        ? "Parceria em andamento"
        : "Propor Parceria"
  const proposeDisabledReason = !proposeDisabled
    ? ""
    : !hasActiveProjects
      ? "Você precisa de um projeto ativo para propor parceria"
      : sentProposal || hasPendingProposal
        ? "Proposta enviada para esta empresa."
        : hasRespondableCompanyInterest
          ? "Esta empresa já demonstrou interesse na sua ONG. Responda pela tela de vínculos."
          : hasRelationshipInProgress
            ? "Todos os seus projetos ativos já possuem parceria em andamento com esta empresa."
            : "Todos os seus projetos ativos já possuem vínculo ou proposta com esta empresa."

  async function handleConfirmPropose(projectId: number) {
    if (!validId) return
    setSubmittingPropose(true)
    try {
      const t = await getAccessTokenSilently()
      await createRelationship(projectId, t, validId)
      const selectedProject = activeProjects.find((p) => p.id === projectId)
      setExistingRelationships((prev) => [
        ...prev.filter(
          (r) => !(r.projectId === projectId && r.partnerInstitutionId === validId),
        ),
        {
          projectId,
          projectName: selectedProject?.title ?? `Projeto ${projectId}`,
          partnerInstitutionId: validId,
          partnerInstitutionName: query.data?.legalName ?? "",
          status: "pending",
          partnerContactEmail: null,
          partnerContactPhone: null,
          canRespond: false,
          canConfirm: false,
        },
      ])
      setSentProposal(true)
      setProposeModalOpen(false)
      showToast("Proposta enviada com sucesso!", "success")
    } catch {
      showToast("Não foi possível enviar a proposta. Tente novamente.", "error")
    } finally {
      setSubmittingPropose(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-10 bg-surface pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
        <Link
          to={dashboardPath}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-vinculo-dark transition-colors hover:text-vinculo-dark-hover"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
          Voltar ao Dashboard
        </Link>

        {query.isLoading && (
          <p className="text-sm text-slate-500" role="status" aria-busy="true">
            Carregando perfil da empresa...
          </p>
        )}

        {!query.isLoading && isNotFound && (
          <article className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-vinculo-dark">
              Empresa não encontrada
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              A empresa que você tentou acessar não existe ou não está mais disponível.
            </p>
          </article>
        )}

        {!query.isLoading && !isNotFound && query.isError && (
          <article
            className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm"
            role="alert"
          >
            <p className="mb-4 text-sm text-slate-700">
              Não foi possível carregar os dados da empresa.
            </p>
            <BaseButton
              type="button"
              variant="primary"
              onClick={() => void query.refetch()}
              className="mx-auto"
            >
              Tentar novamente
            </BaseButton>
          </article>
        )}

        {!query.isLoading && !query.isError && query.data && (
          <>
            <CompanyHeaderCard
              company={query.data}
              showProposeButton={isNpo}
              proposeDisabled={proposeDisabled}
              proposeButtonLabel={proposeButtonLabel}
              proposeDisabledReason={proposeDisabledReason}
              onPropose={() => setProposeModalOpen(true)}
            />
            <CompanyInfoCard company={query.data} />
          </>
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
      </main>
    </div>
  )
}

interface CompanyHeaderCardProps {
  company: CompanyPublicProfile
  showProposeButton: boolean
  proposeDisabled: boolean
  proposeButtonLabel: string
  proposeDisabledReason: string
  onPropose: () => void
}

function CompanyHeaderCard({
  company,
  showProposeButton,
  proposeDisabled,
  proposeButtonLabel,
  proposeDisabledReason,
  onPropose,
}: CompanyHeaderCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-vinculo-dark text-white">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`Logo de ${company.legalName}`}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <ApartmentOutlinedIcon fontSize="large" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-vinculo-dark">
              {company.legalName}
            </h1>
            {company.socialName && (
              <p className="mt-1 text-sm text-slate-500">{company.socialName}</p>
            )}
          </div>
        </div>

        {showProposeButton && (
          <div className="flex w-full sm:w-auto">
            <Tooltip
              title={proposeDisabled ? proposeDisabledReason : ""}
            >
              <span className="w-full sm:w-auto">
                <BaseButton
                  type="button"
                  variant="secondary"
                  fullWidth
                  disabled={proposeDisabled}
                  onClick={onPropose}
                  className="hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit!"
                >
                  <HandshakeOutlinedIcon sx={{ fontSize: 18 }} aria-hidden />
                  {proposeButtonLabel}
                </BaseButton>
              </span>
            </Tooltip>
          </div>
        )}
      </div>

      {company.description && (
        <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600 sm:text-base">
          {company.description}
        </p>
      )}
    </article>
  )
}

function CompanyInfoCard({ company }: { company: CompanyPublicProfile }) {
  const fullAddress = formatAddress(company)
  const hasAnyInfo = Boolean(
    company.cnpj || fullAddress || company.segment || company.website,
  )

  if (!hasAnyInfo) return null

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-base font-semibold text-vinculo-dark">
        Informações da Empresa
      </h2>
      <div className="flex flex-col gap-4">
        {company.cnpj && (
          <InfoRow
            icon={<DescriptionOutlinedIcon fontSize="small" />}
            label="CNPJ"
            value={company.cnpj}
          />
        )}
        {fullAddress && (
          <InfoRow
            icon={<LocationOnOutlinedIcon fontSize="small" />}
            label="Endereço"
            value={fullAddress}
          />
        )}
        {company.segment && (
          <InfoRow
            icon={<ApartmentOutlinedIcon fontSize="small" />}
            label="Segmento"
            value={company.segment}
          />
        )}
        {company.website && (
          <InfoRow
            icon={<ApartmentOutlinedIcon fontSize="small" />}
            label="Website"
            value={company.website}
          />
        )}
      </div>
    </article>
  )
}

function formatAddress(company: CompanyPublicProfile): string | null {
  const streetParts = [company.street, company.number].filter(Boolean).join(", ")
  const street = streetParts || null
  const cityState = [company.city, company.stateCode].filter(Boolean).join(" - ")
  const lines = [
    street,
    company.complement || null,
    cityState || null,
    company.zipCode ? `CEP ${company.zipCode}` : null,
  ].filter((part): part is string => Boolean(part))
  return lines.length > 0 ? lines.join(" · ") : null
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-vinculo-dark">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}
