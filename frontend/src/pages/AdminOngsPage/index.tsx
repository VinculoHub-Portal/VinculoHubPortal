import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  fetchAdminNpos,
  type AdminNpoAreaFilter,
  type AdminNpoCard,
  type AdminNpoStatusFilter,
} from "../../api/admin"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"

const PAGE_SIZE = 12

const AREA_OPTIONS: Array<{ value: AdminNpoAreaFilter | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "environmental", label: "Ambiental" },
  { value: "social", label: "Social" },
  { value: "governance", label: "Governança" },
]

const STATUS_OPTIONS: Array<{ value: AdminNpoStatusFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "inactive", label: "Inativas" },
]

const AREA_BADGE_CLASSES: Record<AdminNpoAreaFilter, string> = {
  environmental: "bg-sky-100 text-sky-700",
  social: "bg-emerald-100 text-emerald-700",
  governance: "bg-amber-100 text-amber-700",
}

const STATUS_BADGE_CLASSES: Record<"active" | "inactive", string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-200 text-slate-700",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date)
}

function buildLocation(npo: AdminNpoCard) {
  const parts = [npo.city, npo.stateCode].filter((part): part is string => Boolean(part))
  return parts.length ? parts.join(" - ") : "Localização não informada"
}

function buildAreaBadges(npo: AdminNpoCard) {
  return [
    npo.environmental ? "environmental" : null,
    npo.social ? "social" : null,
    npo.governance ? "governance" : null,
  ].filter((value): value is AdminNpoAreaFilter => Boolean(value))
}

function NpoCard({ npo }: { npo: AdminNpoCard }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const areaBadges = buildAreaBadges(npo)
  const statusKey = npo.active ? "active" : "inactive"
  const initials = npo.name.trim().charAt(0).toUpperCase() || "O"

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-vinculo-dark text-lg font-semibold text-white">
            {npo.logoUrl && !logoFailed ? (
              <img
                src={npo.logoUrl}
                alt={`Logo de ${npo.name}`}
                className="h-full w-full object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span aria-hidden="true">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-vinculo-dark">{npo.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{buildLocation(npo)}</p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[statusKey]}`}
        >
          {npo.active ? "Ativa" : "Inativa"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {areaBadges.length > 0 ? (
          areaBadges.map((badge) => (
            <span
              key={badge}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${AREA_BADGE_CLASSES[badge]}`}
            >
              {badge === "environmental" && "Ambiental"}
              {badge === "social" && "Social"}
              {badge === "governance" && "Governança"}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Sem área informada
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-500">Cadastrada em {formatDate(npo.createdAt)}</p>
        <Link
          to={`/ong/publico/${npo.id}`}
          className="shrink-0 text-sm font-semibold text-vinculo-dark hover:underline"
        >
          Ver perfil público
        </Link>
      </div>
    </article>
  )
}

export function AdminOngsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [npos, setNpos] = useState<AdminNpoCard[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<AdminNpoAreaFilter | "all">("all")
  const [statusFilter, setStatusFilter] = useState<AdminNpoStatusFilter>("all")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilter)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchFilter])

  useEffect(() => {
    let isMounted = true

    async function loadNpos() {
      setLoading(true)
      setError("")
      try {
        const token = await getAccessTokenSilently()
        const data = await fetchAdminNpos(token, {
          search: debouncedSearch || undefined,
          area: areaFilter,
          status: statusFilter,
          page,
          size: PAGE_SIZE,
        })
        if (!isMounted) return
        setNpos(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar as ONGs.")
          setNpos([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadNpos()

    return () => {
      isMounted = false
    }
  }, [getAccessTokenSilently, debouncedSearch, areaFilter, statusFilter, page])

  function handleAreaChange(value: AdminNpoAreaFilter | "all") {
    setAreaFilter(value)
    setPage(0)
  }

  function handleStatusChange(value: AdminNpoStatusFilter) {
    setStatusFilter(value)
    setPage(0)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/admin/dashboard"
          className="flex w-fit items-center gap-1 text-sm font-medium text-vinculo-dark transition-opacity hover:opacity-70"
        >
          <ChevronLeftIcon fontSize="small" />
          Voltar ao Dashboard
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold leading-tight text-vinculo-dark sm:text-4xl">
            ONGs cadastradas
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Consulte os perfis públicos das organizações e filtre por área de atuação e status.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-vinculo-dark">Vitrine de ONGs</h2>
              <p className="mt-1 text-sm text-slate-600">
                {totalElements} ONG{totalElements !== 1 ? "s" : ""} encontradas
              </p>
            </div>

            <input
              type="text"
              placeholder="Buscar por nome"
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Área
              </span>
              <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar por área">
                {AREA_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={areaFilter === option.value}
                    onClick={() => handleAreaChange(option.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      areaFilter === option.value
                        ? "bg-vinculo-dark text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </span>
              <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar por status">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === option.value
                        ? "bg-vinculo-dark text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && <p className="text-sm text-slate-600">Carregando ONGs...</p>}

          {!loading && error && (
            <p className="text-sm font-medium text-vinculo-red" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && npos.length === 0 && (
            <p className="text-sm text-slate-600">
              Nenhuma ONG encontrada com os filtros selecionados.
            </p>
          )}

          {!loading && !error && npos.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {npos.map((npo) => (
                <NpoCard key={npo.id} npo={npo} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onChange={(newPage) => {
              setPage(newPage)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          />
        </section>
      </main>
    </div>
  )
}
