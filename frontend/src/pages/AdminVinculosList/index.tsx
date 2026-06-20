import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"
import HubOutlinedIcon from "@mui/icons-material/HubOutlined"
import { Link } from "react-router-dom"
import type { AdminRelationshipCard, AdminRelationshipStatusFilter } from "../../api/admin"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"
import { useAdminVinculosPage } from "../AdminVinculosPage"

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
  return value === "company" ? "Iniciado pela empresa" : "Iniciado pela ONG"
}

export function AdminVinculosList() {
  const {
    relationships,
    page,
    totalPages,
    totalElements,
    loading,
    error,
    companyNameFilter,
    npoNameFilter,
    projectTitleFilter,
    statusFilter,
    setCompanyNameFilter,
    setNpoNameFilter,
    setProjectTitleFilter,
    setPage,
    handleStatusChange,
  } = useAdminVinculosPage()

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

          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <HubOutlinedIcon fontSize="small" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-vinculo-dark">Vínculos</h1>
              <p className="text-sm text-slate-500">
                {loading
                  ? "Carregando..."
                  : `${totalElements} vínculo${totalElements !== 1 ? "s" : ""} no total`}
              </p>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <input
              type="text"
              placeholder="Filtrar por empresa"
              value={companyNameFilter}
              onChange={(event) => setCompanyNameFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
            />
            <input
              type="text"
              placeholder="Filtrar por ONG"
              value={npoNameFilter}
              onChange={(event) => setNpoNameFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
            />
            <input
              type="text"
              placeholder="Filtrar por projeto"
              value={projectTitleFilter}
              onChange={(event) => setProjectTitleFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
            />
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

          {!loading && !error && relationships.length === 0 && (
            <p className="p-6 text-sm text-slate-500">
              Nenhum vínculo encontrado com os filtros selecionados.
            </p>
          )}

          {!loading && !error && relationships.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500">
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Empresa
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Projeto
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        ONG
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Última atualização
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relationships.map((relationship) => (
                      <tr
                        key={`${relationship.companyId}-${relationship.projectId}`}
                        className="text-slate-700 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-vinculo-dark">{relationship.companyName}</p>
                          {relationship.companyEmail && (
                            <p className="mt-1 text-xs text-slate-500">
                              {relationship.companyEmail}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/projeto/${relationship.projectId}`}
                            className="font-medium text-vinculo-dark hover:underline"
                          >
                            {relationship.projectTitle}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            Projeto #{relationship.projectId}
                          </p>
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
                              className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGES[relationship.status]}`}
                            >
                              {STATUS_LABELS[relationship.status]}
                            </span>
                            <span className="text-xs text-slate-500">
                              {initiatorLabel(relationship.initiatorType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {formatDate(relationship.updatedAt)}
                        </td>
                      </tr>
                    ))}
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
