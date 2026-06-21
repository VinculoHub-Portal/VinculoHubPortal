import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined"
import { Link } from "react-router-dom"
import type { AdminNpoAreaFilter, AdminNpoStatusFilter } from "../../api/admin"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"
import { useAdminOngsPage } from "../AdminOngsPage/useAdminOngsPage"

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

const STATUS_BADGE_CLASSES: Record<"active" | "inactive", string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-200 text-slate-700",
}

const AREA_BADGE_CLASSES: Record<AdminNpoAreaFilter, string> = {
  environmental: "bg-sky-100 text-sky-700",
  social: "bg-emerald-100 text-emerald-700",
  governance: "bg-amber-100 text-amber-700",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date)
}

function buildLocation(city: string | null, stateCode: string | null) {
  if (city && stateCode) return `${city}, ${stateCode}`
  return city ?? stateCode ?? "—"
}

function buildAreaBadges(environmental: boolean, social: boolean, governance: boolean) {
  return [
    environmental ? "environmental" : null,
    social ? "social" : null,
    governance ? "governance" : null,
  ].filter((value): value is AdminNpoAreaFilter => Boolean(value))
}

export function AdminOngsList() {
  const {
    npos,
    page,
    totalPages,
    totalElements,
    loading,
    error,
    searchFilter,
    areaFilter,
    statusFilter,
    setSearchFilter,
    setPage,
    handleAreaChange,
    handleStatusChange,
  } = useAdminOngsPage()

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-vinculo-dark"
          >
            <ArrowBackOutlinedIcon fontSize="small" />
            Voltar ao painel
          </Link>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-vinculo-dark/10 text-vinculo-dark">
                <CorporateFareOutlinedIcon fontSize="small" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-vinculo-dark">ONGs cadastradas</h1>
                <p className="text-sm text-slate-500">
                  {loading
                    ? "Carregando..."
                    : `${totalElements} organização${totalElements !== 1 ? "ões" : ""} no total`}
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Filtrar por nome"
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
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
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && (
            <div className="p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="mb-4 h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="p-6 text-sm font-medium text-vinculo-red" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && npos.length === 0 && (
            <p className="p-6 text-sm text-slate-500">
              Nenhuma ONG encontrada com os filtros selecionados.
            </p>
          )}

          {!loading && !error && npos.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500">
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Nome
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Áreas
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Localização
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Cadastro
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {npos.map((npo) => {
                      const areaBadges = buildAreaBadges(
                        npo.environmental,
                        npo.social,
                        npo.governance,
                      )
                      const statusKey = npo.active ? "active" : "inactive"

                      return (
                        <tr key={npo.id} className="text-slate-700 hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-vinculo-dark">{npo.name}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[statusKey]}`}
                            >
                              {npo.active ? "Ativa" : "Inativa"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {areaBadges.length > 0 ? (
                                areaBadges.map((badge) => (
                                  <span
                                    key={badge}
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${AREA_BADGE_CLASSES[badge]}`}
                                  >
                                    {badge === "environmental" && "Ambiental"}
                                    {badge === "social" && "Social"}
                                    {badge === "governance" && "Governança"}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-500">
                            {buildLocation(npo.city, npo.stateCode)}
                          </td>
                          <td className="px-4 py-4 text-slate-500">
                            {formatDate(npo.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/ong/publico/${npo.id}`}
                              className="text-sm font-medium text-vinculo-dark hover:underline"
                            >
                              Ver perfil
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 px-6 py-2">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onChange={(nextPage) => {
                    setPage(nextPage)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
