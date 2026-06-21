import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined"
import CloseIcon from "@mui/icons-material/Close"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import LinkIcon from "@mui/icons-material/Link"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import {
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import { useAuth0 } from "@auth0/auth0-react"
import { useMemo, useState, type ReactNode } from "react"
import type { NavigateFunction } from "react-router-dom"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  acceptRelationship,
  confirmRelationship,
  rejectRelationship,
} from "../../api/relationships"
import { Header } from "../../components/general/Header"
import { EfetivarParceriaModal } from "../../components/relationships/EfetivarParceriaModal"
import { useToast } from "../../context/ToastContext"
import { resolveDashboardPath } from "../../utils/dashboardPath"
import { useAuthProfile } from "../../hooks/useAuthProfile"
import { useMyRelationships } from "../../hooks/useMyRelationships"
import { RejectRelationshipModal } from "../RelationshipsPage/components/RejectRelationshipModal"
import {
  filterVinculos,
  getVinculoFilterCounts,
  mapRelationshipsToVinculos,
  type VinculoConnection,
  type VinculoFilter,
  type VinculoStatus,
} from "./vinculo"

const FILTER_OPTIONS: Array<{
  filter: VinculoFilter
  label: string
  valueClassName: string
  selectedClassName: string
}> = [
  {
    filter: "all",
    label: "Todos",
    valueClassName: "text-vinculo-dark",
    selectedClassName: "border-vinculo-dark bg-blue-50/60",
  },
  {
    filter: "pending",
    label: "Pendentes",
    valueClassName: "text-amber-500",
    selectedClassName: "border-amber-300 bg-amber-50/80",
  },
  {
    filter: "negotiation",
    label: "Em Negociação",
    valueClassName: "text-blue-500",
    selectedClassName: "border-blue-300 bg-blue-50/80",
  },
  {
    filter: "active",
    label: "Ativos",
    valueClassName: "text-emerald-600",
    selectedClassName: "border-emerald-300 bg-emerald-50/80",
  },
]

const STATUS_META: Record<
  VinculoStatus,
  {
    label: string
    chipBgColor: string
    chipTextColor: string
    icon: typeof CheckCircleOutlineIcon
  }
> = {
  active: {
    label: "Ativo",
    chipBgColor: "rgba(16, 185, 129, 0.14)",
    chipTextColor: "#047857",
    icon: CheckCircleOutlineIcon,
  },
  negotiation: {
    label: "Em Negociação",
    chipBgColor: "rgba(59, 130, 246, 0.14)",
    chipTextColor: "#2563eb",
    icon: LinkIcon,
  },
  pending_waiting: {
    label: "Pendente",
    chipBgColor: "rgba(251, 191, 36, 0.2)",
    chipTextColor: "#b45309",
    icon: AccessTimeOutlinedIcon,
  },
  pending_interest: {
    label: "Pendente",
    chipBgColor: "rgba(251, 191, 36, 0.2)",
    chipTextColor: "#b45309",
    icon: AccessTimeOutlinedIcon,
  },
}

const BUTTON_BASE_SX = {
  borderRadius: "999px",
  textTransform: "none",
  fontWeight: 600,
  px: 2,
  py: 1.1,
  minHeight: 44,
  boxShadow: "none",
  whiteSpace: "nowrap",
  "& .MuiButton-startIcon": {
    marginRight: "8px",
  },
}

const VALID_FILTERS: ReadonlyArray<VinculoFilter> = [
  "all",
  "pending",
  "negotiation",
  "active",
]

function parseFilterParam(raw: string | null): VinculoFilter {
  if (raw && (VALID_FILTERS as ReadonlyArray<string>).includes(raw)) {
    return raw as VinculoFilter
  }
  return "all"
}

export function MyRelationshipsPage() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, user } = useAuth0()
  const { showToast } = useToast()
  const { data: profile } = useAuthProfile()
  const {
    data: relationships,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useMyRelationships()
  const [searchParams] = useSearchParams()
  const initialFilter = parseFilterParam(searchParams.get("filter"))
  const [selectedFilter, setSelectedFilter] =
    useState<VinculoFilter>(initialFilter)
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const [vinculoToReject, setVinculoToReject] =
    useState<VinculoConnection | null>(null)
  const [rejectMode, setRejectMode] = useState<"pending" | "negotiation">(
    "pending",
  )
  const [vinculoToConfirm, setVinculoToConfirm] =
    useState<VinculoConnection | null>(null)
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false)

  const vinculos = useMemo(
    () => mapRelationshipsToVinculos(relationships ?? [], profile?.userType ?? null),
    [relationships, profile?.userType],
  )

  const dashboardPath = resolveDashboardPath(user)
  const summaryCounts = getVinculoFilterCounts(vinculos)
  const visibleVinculos = filterVinculos(vinculos, selectedFilter)

  function resolveCompanyId(vinculo: VinculoConnection): number | null {
    if (profile?.userType === "company") return profile.companyId ?? null
    if (profile?.userType === "npo") return vinculo.companyId
    return null
  }

  async function handleAccept(vinculo: VinculoConnection) {
    const companyId = resolveCompanyId(vinculo)
    if (companyId === null) {
      showToast("Não foi possível identificar a empresa deste vínculo.", "error")
      return
    }

    setIsSubmittingResponse(true)
    try {
      const token = await getAccessTokenSilently()
      await acceptRelationship(companyId, vinculo.projectId, token)
      showToast("Contato aceito com sucesso.", "success")
      await refetch()
    } catch {
      showToast("Não foi possível aceitar o contato. Tente novamente.", "error")
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  async function handleConfirmReject() {
    if (!vinculoToReject) return

    const companyId = resolveCompanyId(vinculoToReject)
    if (companyId === null) {
      showToast("Não foi possível identificar a empresa deste vínculo.", "error")
      return
    }

    const isCancellingNegotiation = rejectMode === "negotiation"
    const successMessage = isCancellingNegotiation
      ? "Parceria cancelada com sucesso."
      : "Contato recusado com sucesso."
    const errorMessage = isCancellingNegotiation
      ? "Não foi possível cancelar a parceria. Tente novamente."
      : "Não foi possível recusar o contato. Tente novamente."

    setIsSubmittingResponse(true)
    try {
      const token = await getAccessTokenSilently()
      await rejectRelationship(companyId, vinculoToReject.projectId, token)
      showToast(successMessage, "success")
      setVinculoToReject(null)
      await refetch()
    } catch {
      showToast(errorMessage, "error")
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  async function handleConfirmEfetivar() {
    if (!vinculoToConfirm) return

    const companyId = resolveCompanyId(vinculoToConfirm)
    if (companyId === null) {
      showToast("Não foi possível identificar a empresa deste vínculo.", "error")
      return
    }

    setIsSubmittingConfirm(true)
    try {
      const token = await getAccessTokenSilently()
      await confirmRelationship(companyId, vinculoToConfirm.projectId, token)
      setVinculoToConfirm(null)
      showToast("Parceria confirmada com sucesso!", "success")
      await refetch()
    } catch {
      showToast(
        "Não foi possível efetivar a parceria. Tente novamente.",
        "error",
      )
    } finally {
      setIsSubmittingConfirm(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-10 bg-surface pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6">
        <Link
          to={dashboardPath}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-vinculo-dark transition-colors hover:text-vinculo-dark-hover"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
          Voltar ao Dashboard
        </Link>

        <header className="max-w-3xl">
          <h1 className="text-2xl font-semibold leading-9 text-vinculo-dark sm:text-3xl">
            Meus Vínculos
          </h1>
          <p className="mt-2 text-base leading-6 text-slate-500">
            Gerencie suas conexões e acompanhe o status das negociações em andamento.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {FILTER_OPTIONS.map((option) => (
            <SummaryCard
              key={option.filter}
              label={option.label}
              value={summaryCounts[option.filter]}
              isSelected={selectedFilter === option.filter}
              valueClassName={option.valueClassName}
              selectedClassName={option.selectedClassName}
              onClick={() => setSelectedFilter(option.filter)}
            />
          ))}
        </section>

        <section className="flex flex-col gap-4" aria-label="Lista de vínculos">
          {isPending ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} isRetrying={isRefetching} />
          ) : visibleVinculos.length === 0 ? (
            <EmptyState />
          ) : (
            visibleVinculos.map((vinculo) => (
              <VinculoCard
                key={vinculo.id}
                vinculo={vinculo}
                navigate={navigate}
                isSubmittingResponse={isSubmittingResponse}
                onAccept={handleAccept}
                onReject={(v) => {
                  setRejectMode("pending")
                  setVinculoToReject(v)
                }}
                onEfetivar={setVinculoToConfirm}
                onCancel={(v) => {
                  setRejectMode("negotiation")
                  setVinculoToReject(v)
                }}
              />
            ))
          )}
        </section>
      </main>

      <RejectRelationshipModal
        open={vinculoToReject !== null}
        isSubmitting={isSubmittingResponse}
        onCancel={() => setVinculoToReject(null)}
        onConfirm={handleConfirmReject}
        title={
          rejectMode === "negotiation"
            ? "Cancelar parceria?"
            : "Recusar contato?"
        }
        description={
          rejectMode === "negotiation"
            ? "Ao confirmar, a negociação será encerrada e a outra parte será notificada."
            : "Ao confirmar, você recusará este primeiro contato e a instituição parceira será informada."
        }
        confirmLabel={
          rejectMode === "negotiation"
            ? "Confirmar cancelamento"
            : "Confirmar recusa"
        }
        submittingLabel={
          rejectMode === "negotiation" ? "Cancelando..." : "Recusando..."
        }
      />

      {vinculoToConfirm && (
        <EfetivarParceriaModal
          open
          onClose={() => setVinculoToConfirm(null)}
          onConfirm={() => void handleConfirmEfetivar()}
          loading={isSubmittingConfirm}
          projectName={vinculoToConfirm.projectName}
          partnerName={vinculoToConfirm.partnerInstitutionName}
        />
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  isSelected,
  valueClassName,
  selectedClassName,
  onClick,
}: {
  label: string
  value: number
  isSelected: boolean
  valueClassName: string
  selectedClassName: string
  onClick: () => void
}) {
  return (
    <Card
      elevation={0}
      className={`overflow-hidden rounded-[18px] border transition-all duration-200 ${
        isSelected
          ? `${selectedClassName} shadow-[0_10px_30px_rgba(0,68,129,0.12)]`
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <CardActionArea
        onClick={onClick}
        className="h-full"
        aria-pressed={isSelected}
      >
        <div className="flex h-full flex-col justify-between p-5 sm:p-6">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <span className={`mt-2 text-3xl font-semibold leading-none sm:text-4xl ${valueClassName}`}>
            {value}
          </span>
        </div>
      </CardActionArea>
    </Card>
  )
}

function VinculoCard({
  vinculo,
  navigate,
  isSubmittingResponse,
  onAccept,
  onReject,
  onEfetivar,
  onCancel,
}: {
  vinculo: VinculoConnection
  navigate: NavigateFunction
  isSubmittingResponse: boolean
  onAccept: (vinculo: VinculoConnection) => void
  onReject: (vinculo: VinculoConnection) => void
  onEfetivar?: (vinculo: VinculoConnection) => void
  onCancel?: (vinculo: VinculoConnection) => void
}) {
  const statusMeta = STATUS_META[vinculo.status]
  const StatusIcon = statusMeta.icon
  const showContact = vinculo.status === "active" || vinculo.status === "negotiation"
  const showConfirmActions = vinculo.status === "pending_interest"
  const showOptionalAction = vinculo.status === "negotiation" && Boolean(vinculo.optionalActionLabel)
  const showCancelAction = vinculo.status === "negotiation"

  return (
    <Card
      elevation={0}
      className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start gap-2">
          <Chip
            icon={<StatusIcon sx={{ fontSize: 16 }} />}
            label={statusMeta.label}
            size="small"
            className="rounded-full font-semibold"
            sx={{
              bgcolor: statusMeta.chipBgColor,
              color: statusMeta.chipTextColor,
              fontWeight: 700,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />

          {vinculo.secondaryBadgeLabel && (
            <Chip
              label={vinculo.secondaryBadgeLabel}
              size="small"
              className="rounded-full font-medium"
              sx={{
                bgcolor: "rgba(251, 191, 36, 0.15)",
                color: "#b45309",
                fontWeight: 600,
                "& .MuiChip-label": {
                  px: 1.25,
                },
              }}
            />
          )}
        </div>

        <h2 className="mt-4 text-lg font-semibold text-vinculo-dark sm:text-xl">
          {vinculo.projectName}
        </h2>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <PersonOutlineIcon sx={{ fontSize: 18 }} />
          <span>{vinculo.partnerInstitutionName}</span>
        </div>

        {(vinculo.requestedAt || vinculo.activeSince) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {vinculo.requestedAt && (
              <span className="inline-flex items-center gap-1.5">
                <AccessTimeOutlinedIcon sx={{ fontSize: 17 }} />
                <span>Solicitado em {vinculo.requestedAt}</span>
              </span>
            )}

            {vinculo.activeSince && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />
                <span>Ativo desde {vinculo.activeSince}</span>
              </span>
            )}
          </div>
        )}

        {showContact && vinculo.contact && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 sm:px-5">
            <h3 className="text-sm font-semibold text-vinculo-dark">
              Informações de Contato
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              {vinculo.contact.email && (
                <ContactRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}>
                  <a
                    href={`mailto:${vinculo.contact.email}`}
                    className="text-blue-700 transition hover:underline"
                  >
                    {vinculo.contact.email}
                  </a>
                </ContactRow>
              )}

              {vinculo.contact.phone && (
                <ContactRow icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}>
                  <span>{vinculo.contact.phone}</span>
                </ContactRow>
              )}

              {vinculo.contact.websiteHref && (
                <ContactRow icon={<LanguageOutlinedIcon sx={{ fontSize: 18 }} />}>
                  <a
                    href={vinculo.contact.websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 transition hover:underline"
                  >
                    {vinculo.contact.websiteLabel}
                  </a>
                </ContactRow>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <ActionButton
              variant="outlined"
              icon={<AssignmentOutlinedIcon fontSize="small" />}
              onClick={() => navigate(`/projeto/${vinculo.projectId}`)}
            >
              Ver Projeto
            </ActionButton>

            {vinculo.partnerType === "ONG" && (
              <ActionButton
                variant="outlined"
                colorScheme="neutral"
                icon={<PersonOutlineIcon fontSize="small" />}
                onClick={() => navigate(`/ong/publico/${vinculo.partnerId}`)}
              >
                Ver Perfil da ONG
              </ActionButton>
            )}

            {showConfirmActions && (
              <>
                <ActionButton
                  variant="contained"
                  colorScheme="success"
                  icon={<CheckOutlinedIcon fontSize="small" />}
                  disabled={isSubmittingResponse}
                  onClick={() => onAccept(vinculo)}
                >
                  Aceitar Contato
                </ActionButton>

                <ActionButton
                  variant="contained"
                  colorScheme="neutral"
                  icon={<CloseIcon fontSize="small" />}
                  disabled={isSubmittingResponse}
                  onClick={() => onReject(vinculo)}
                >
                  Recusar
                </ActionButton>
              </>
            )}

            {showOptionalAction && vinculo.optionalActionLabel && (
              <ActionButton
                variant="contained"
                colorScheme="success"
                icon={<CheckOutlinedIcon fontSize="small" />}
                onClick={() => {
                  if (
                    vinculo.optionalActionLabel === "Efetivar Parceria" &&
                    onEfetivar
                  ) {
                    onEfetivar(vinculo)
                  } else {
                    navigate(`/projeto/${vinculo.projectId}`)
                  }
                }}
              >
                {vinculo.optionalActionLabel}
              </ActionButton>
            )}

            {showCancelAction && onCancel && (
              <ActionButton
                variant="outlined"
                colorScheme="danger"
                icon={<CloseIcon fontSize="small" />}
                onClick={() => onCancel(vinculo)}
              >
                Cancelar Parceria
              </ActionButton>
            )}
          </div>
        </div>
      </div>

      {vinculo.infoBanner && (
        <div className="px-6 pb-6 sm:px-7">
          <InfoBanner banner={vinculo.infoBanner} />
        </div>
      )}
    </Card>
  )
}

function ContactRow({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-vinculo-dark">{icon}</span>
      {children}
    </div>
  )
}

function ActionButton({
  children,
  icon,
  variant,
  colorScheme = "brand",
  disabled = false,
  onClick,
}: {
  children: ReactNode
  icon: ReactNode
  variant: "outlined" | "contained"
  colorScheme?: "brand" | "success" | "neutral" | "danger"
  disabled?: boolean
  onClick: () => void
}) {
  const styleByScheme = {
    brand: {
      outlined: {
        borderColor: "var(--color-vinculo-dark)",
        color: "var(--color-vinculo-dark)",
        backgroundColor: "transparent",
        "&:hover": {
          borderColor: "var(--color-vinculo-dark)",
          backgroundColor: "rgba(0, 68, 129, 0.05)",
        },
      },
      contained: {
        backgroundColor: "var(--color-vinculo-dark)",
        color: "#fff",
        "&:hover": {
          backgroundColor: "var(--color-vinculo-dark-hover)",
        },
      },
    },
    success: {
      outlined: {
        borderColor: "var(--color-vinculo-green)",
        color: "var(--color-vinculo-green)",
        backgroundColor: "transparent",
        "&:hover": {
          borderColor: "var(--color-vinculo-green)",
          backgroundColor: "rgba(109, 177, 124, 0.08)",
        },
      },
      contained: {
        backgroundColor: "var(--color-vinculo-green)",
        color: "#fff",
        "&:hover": {
          backgroundColor: "#569a67",
        },
      },
    },
    neutral: {
      outlined: {
        borderColor: "rgb(203 213 225)",
        color: "rgb(51 65 85)",
        backgroundColor: "transparent",
        "&:hover": {
          borderColor: "rgb(148 163 184)",
          backgroundColor: "rgb(248 250 252)",
        },
      },
      contained: {
        backgroundColor: "rgb(229 231 235)",
        color: "rgb(55 65 81)",
        "&:hover": {
          backgroundColor: "rgb(209 213 219)",
        },
      },
    },
    danger: {
      outlined: {
        borderColor: "var(--color-vinculo-red, #dc2626)",
        color: "var(--color-vinculo-red, #dc2626)",
        backgroundColor: "transparent",
        "&:hover": {
          borderColor: "var(--color-vinculo-red, #dc2626)",
          backgroundColor: "rgba(220, 38, 38, 0.05)",
        },
      },
      contained: {
        backgroundColor: "var(--color-vinculo-red, #dc2626)",
        color: "#fff",
        "&:hover": {
          backgroundColor: "#b91c1c",
        },
      },
    },
  } as const

  return (
    <Button
      type="button"
      disableElevation
      variant={variant}
      startIcon={icon}
      onClick={onClick}
      disabled={disabled}
      sx={{
        ...BUTTON_BASE_SX,
        ...(styleByScheme[colorScheme][variant] as Record<string, unknown>),
      }}
    >
      {children}
    </Button>
  )
}

function InfoBanner({
  banner,
}: {
  banner:
    | { tone: "warning"; text: string }
    | {
        tone: "success"
        prefix: string
        highlightedPartner: string
        suffix: string
      }
}) {
  const toneClassName =
    banner.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-800"

  if (banner.tone === "warning") {
    return (
      <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClassName}`}>
        {banner.text}
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClassName}`}>
      {banner.prefix}
      <span className="font-semibold text-emerald-700">{banner.highlightedPartner}</span>
      {banner.suffix}
    </div>
  )
}

function EmptyState() {
  return (
    <Card
      elevation={0}
      className="rounded-[20px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm"
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500">
        <LinkIcon fontSize="small" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-vinculo-dark">
        Nenhum vínculo encontrado
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Não há conexões para o filtro selecionado no momento.
      </p>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card
      elevation={0}
      className="flex flex-col items-center gap-4 rounded-[20px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
    >
      <CircularProgress size={32} sx={{ color: "var(--color-vinculo-dark)" }} />
      <p className="text-sm leading-6 text-slate-500">Carregando seus vínculos...</p>
    </Card>
  )
}

function ErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <Card
      elevation={0}
      className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm"
    >
      <h2 className="text-lg font-semibold text-red-700">
        Não foi possível carregar seus vínculos
      </h2>
      <p className="mt-2 text-sm leading-6 text-red-600">
        Ocorreu um erro ao buscar suas conexões. Tente novamente em instantes.
      </p>
      <div className="mt-5 flex justify-center">
        <Button
          type="button"
          variant="outlined"
          disableElevation
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={onRetry}
          disabled={isRetrying}
          sx={{
            ...BUTTON_BASE_SX,
            borderColor: "#dc2626",
            color: "#dc2626",
            "&:hover": {
              borderColor: "#dc2626",
              backgroundColor: "rgba(220, 38, 38, 0.05)",
            },
          }}
        >
          {isRetrying ? "Tentando..." : "Tentar novamente"}
        </Button>
      </div>
    </Card>
  )
}
