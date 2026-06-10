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
} from "@mui/material"
import { useAuth0 } from "@auth0/auth0-react"
import { useState, type ReactNode } from "react"
import type { NavigateFunction } from "react-router-dom"
import { Link, useNavigate } from "react-router-dom"
import { PortalTopbar } from "../../components/general/PortalTopbar"
import { resolveDashboardPath } from "../../utils/dashboardPath"
import {
  filterVinculos,
  getOpenVinculoCount,
  getVinculoFilterCounts,
  mockVinculos,
  type VinculoConnection,
  type VinculoFilter,
  type VinculoStatus,
} from "./mockData"

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

export function MyRelationshipsPage() {
  const navigate = useNavigate()
  const { user } = useAuth0()
  const [selectedFilter, setSelectedFilter] = useState<VinculoFilter>("all")

  const dashboardPath = resolveDashboardPath(user)
  const userLabel = user?.name ?? user?.nickname ?? "Admin"
  const summaryCounts = getVinculoFilterCounts(mockVinculos)
  const visibleVinculos = filterVinculos(mockVinculos, selectedFilter)
  const openVinculosCount = getOpenVinculoCount(mockVinculos)

  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <PortalTopbar
        homeHref={dashboardPath}
        vinculosHref="/meus-vinculos"
        vinculosCount={openVinculosCount}
        userLabel={userLabel}
        avatarVariant="icon"
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
        <Link
          to={dashboardPath}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-vinculo-dark transition-colors hover:text-vinculo-dark-hover"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
          Voltar ao Dashboard
        </Link>

        <header className="max-w-3xl">
          <h1 className="text-2xl font-medium leading-tight text-vinculo-dark sm:text-3xl">
            Meus Vínculos
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
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
          {visibleVinculos.length === 0 ? (
            <EmptyState />
          ) : (
            visibleVinculos.map((vinculo) => (
              <VinculoCard
                key={vinculo.id}
                vinculo={vinculo}
                navigate={navigate}
              />
            ))
          )}
        </section>
      </main>
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
}: {
  vinculo: VinculoConnection
  navigate: NavigateFunction
}) {
  const statusMeta = STATUS_META[vinculo.status]
  const StatusIcon = statusMeta.icon
  const showContact = vinculo.status === "active" || vinculo.status === "negotiation"
  const showConfirmActions = vinculo.status === "pending_interest"
  const showOptionalAction = vinculo.status === "negotiation" && Boolean(vinculo.optionalActionLabel)

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

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <AccessTimeOutlinedIcon sx={{ fontSize: 17 }} />
            <span>Solicitado em {vinculo.requestedAt}</span>
          </span>

          {vinculo.activeSince && (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />
              <span>Ativo desde {vinculo.activeSince}</span>
            </span>
          )}
        </div>

        {showContact && vinculo.contact && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 sm:px-5">
            <h3 className="text-sm font-semibold text-vinculo-dark">
              Informações de Contato
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              <ContactRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}>
                <a
                  href={`mailto:${vinculo.contact.email}`}
                  className="text-blue-700 transition hover:underline"
                >
                  {vinculo.contact.email}
                </a>
              </ContactRow>

              <ContactRow icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}>
                <span>{vinculo.contact.phone}</span>
              </ContactRow>

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

            <ActionButton
              variant="outlined"
              colorScheme="neutral"
              icon={<PersonOutlineIcon fontSize="small" />}
              onClick={() => navigate(`/ong/publico/${vinculo.partnerId}`)}
            >
              Ver Perfil da ONG
            </ActionButton>

            {showConfirmActions && (
              <>
                <ActionButton
                  variant="contained"
                  colorScheme="success"
                  icon={<CheckOutlinedIcon fontSize="small" />}
                  onClick={() => navigate(`/projeto/${vinculo.projectId}`)}
                >
                  Confirmar Primeiro Aperto de Mão
                </ActionButton>

                <ActionButton
                  variant="contained"
                  colorScheme="neutral"
                  icon={<CloseIcon fontSize="small" />}
                  onClick={() => navigate(`/projeto/${vinculo.projectId}`)}
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
                onClick={() => navigate(`/projeto/${vinculo.projectId}`)}
              >
                {vinculo.optionalActionLabel}
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
  onClick,
}: {
  children: ReactNode
  icon: ReactNode
  variant: "outlined" | "contained"
  colorScheme?: "brand" | "success" | "neutral"
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
  } as const

  return (
    <Button
      type="button"
      disableElevation
      variant={variant}
      startIcon={icon}
      onClick={onClick}
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
