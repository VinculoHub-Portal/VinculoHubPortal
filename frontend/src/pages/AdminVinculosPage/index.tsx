import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  fetchAdminRelationships,
  type AdminRelationshipCard,
  type AdminRelationshipStatusFilter,
} from "../../api/admin"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"

const PAGE_SIZE = 10

const STATUS_OPTIONS: Array<{ value: AdminRelationshipStatusFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "negotiation", label: "Em negociação" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
]

const STATUS_LABELS: Record<Exclude<AdminRelationshipStatusFilter, "all">, string> = {
  pending: "Pendente",
  negotiation: "Negociação",
  active: "Ativo",
  inactive: "Inativo",
}

const STATUS_BADGES: Record<Exclude<AdminRelationshipStatusFilter, "all">, string> = {
  pending: "bg-amber-100 text-amber-800",
  negotiation: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-200 text-slate-700",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function initiatorLabel(value: AdminRelationshipCard["initiatorType"]) {
  return value === "company" ? "empresa" : "ONG"
}

function RelationshipRow({ relationship }: { relationship: AdminRelationshipCard }) {
  const statusKey = relationship.status

  return (
    <tr className="align-top text-slate-700">
      <td className="py-4 pr-4">
        <Link
          to={`/projeto/${relationship.projectId}`}
          className="font-semibold text-vinculo-dark hover:underline"
        >
          {relationship.projectTitle}
        </Link>
        <p className="mt-1 text-xs text-slate-500">Projeto #{relationship.projectId}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-800">{relationship.companyName}</p>
        {relationship.companyEmail && (
          <p className="mt-1 text-xs text-slate-500">{relationship.companyEmail}</p>
        )}
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-800">{relationship.npoName}</p>
        {relationship.npoEmail && (
          <p className="mt-1 text-xs text-slate-500">{relationship.npoEmail}</p>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[statusKey]}`}
          >
            {STATUS_LABELS[statusKey]}
          </span>
          <span className="text-xs text-slate-500">
            Iniciado pela {initiatorLabel(relationship.initiatorType)}
          </span>
        </div>
      </td>
      <td className="py-4 pl-4 pr-4 text-slate-500">{formatDate(relationship.updatedAt)}</td>
    </tr>
  )
}

export function AdminVinculosPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [relationships, setRelationships] = useState<AdminRelationshipCard[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [companyNameFilter, setCompanyNameFilter] = useState("")
  const [npoNameFilter, setNpoNameFilter] = useState("")
  const [projectTitleFilter, setProjectTitleFilter] = useState("")
  const [debouncedCompanyName, setDebouncedCompanyName] = useState("")
  const [debouncedNpoName, setDebouncedNpoName] = useState("")
  const [debouncedProjectTitle, setDebouncedProjectTitle] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminRelationshipStatusFilter>("all")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyName(companyNameFilter)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [companyNameFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNpoName(npoNameFilter)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [npoNameFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProjectTitle(projectTitleFilter)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [projectTitleFilter])

  useEffect(() => {
    let isMounted = true

    async function loadRelationships() {
      setLoading(true)
      setError("")
      try {
        const token = await getAccessTokenSilently()
        const data = await fetchAdminRelationships(token, {
          companyName: debouncedCompanyName || undefined,
          npoName: debouncedNpoName || undefined,
          projectTitle: debouncedProjectTitle || undefined,
          status: statusFilter,
          page,
          size: PAGE_SIZE,
        })
        if (!isMounted) return
        setRelationships(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar os vínculos.")
          setRelationships([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadRelationships()

    return () => {
      isMounted = false
    }
  }, [
    getAccessTokenSilently,
    debouncedCompanyName,
    debouncedNpoName,
    debouncedProjectTitle,
    statusFilter,
    page,
  ])

  function handleStatusChange(value: AdminRelationshipStatusFilter) {
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
            Vínculos
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Acompanhe as conexões entre empresas e ONGs em uma visão administrativa consolidada.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-vinculo-dark">Mapa de vínculos</h2>
              <p className="mt-1 text-sm text-slate-600">
                {totalElements} vínculo{totalElements !== 1 ? "s" : ""} encontrados
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Empresa"
                value={companyNameFilter}
                onChange={(event) => setCompanyNameFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
              <input
                type="text"
                placeholder="ONG"
                value={npoNameFilter}
                onChange={(event) => setNpoNameFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
              <input
                type="text"
                placeholder="Projeto"
                value={projectTitleFilter}
                onChange={(event) => setProjectTitleFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
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

          {loading && <p className="text-sm text-slate-600">Carregando vínculos...</p>}

          {!loading && error && (
            <p className="text-sm font-medium text-vinculo-red" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && relationships.length === 0 && (
            <p className="text-sm text-slate-600">
              Nenhum vínculo encontrado com os filtros selecionados.
            </p>
          )}

          {!loading && !error && relationships.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th scope="col" className="py-3 pl-4 pr-4 font-semibold">
                      Projeto
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Empresa
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      ONG
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-4 font-semibold">
                      Atualizado em
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relationships.map((relationship) => (
                    <RelationshipRow
                      key={`${relationship.companyId}-${relationship.projectId}`}
                      relationship={relationship}
                    />
                  ))}
                </tbody>
              </table>
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
