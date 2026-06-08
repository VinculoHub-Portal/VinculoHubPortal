import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchAdminNpoReports, updateAdminNpoReportStatus, type NpoReportResponse, type NpoReportStatus } from "../../api/npoReports"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"
import { useToast } from "../../context/ToastContext"

const PAGE_SIZE = 5

const REPORT_STATUS_LABELS: Record<NpoReportResponse["status"], string> = {
  OPEN: "Aberta",
  RESOLVED: "Resolvida",
  DISMISSED: "Descartada",
}

const REPORT_STATUS_OPTIONS: NpoReportStatus[] = ["OPEN", "RESOLVED", "DISMISSED"]

function formatReportDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function AdminNotificationsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()
  const [reports, setReports] = useState<NpoReportResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [reportsError, setReportsError] = useState("")
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null)
  const [npoNameFilter, setNpoNameFilter] = useState("")
  const [companyNameFilter, setCompanyNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<NpoReportStatus>("OPEN")
  const [debouncedNpoName, setDebouncedNpoName] = useState("")
  const [debouncedCompanyName, setDebouncedCompanyName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNpoName(npoNameFilter)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [npoNameFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyName(companyNameFilter)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [companyNameFilter])

  useEffect(() => {
    let isMounted = true

    async function loadReports() {
      setIsLoadingReports(true)
      setReportsError("")
      try {
        const token = await getAccessTokenSilently()
        const data = await fetchAdminNpoReports(token, {
          npoName: debouncedNpoName || undefined,
          companyName: debouncedCompanyName || undefined,
          status: statusFilter,
          page,
          size: PAGE_SIZE,
        })
        if (!isMounted) return
        setReports(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch {
        if (isMounted) {
          setReportsError("Não foi possível carregar as denúncias.")
          setReports([])
        }
      } finally {
        if (isMounted) setIsLoadingReports(false)
      }
    }

    void loadReports()

    return () => {
      isMounted = false
    }
  }, [getAccessTokenSilently, debouncedNpoName, debouncedCompanyName, statusFilter, page, refreshKey])

  async function handleStatusChange(reportId: number, newStatus: NpoReportStatus) {
    setUpdatingReportId(reportId)
    const oldReport = reports.find((r) => r.id === reportId)
    try {
      const token = await getAccessTokenSilently()
      await updateAdminNpoReportStatus(reportId, { status: newStatus }, token)
      showToast(`Status atualizado para "${REPORT_STATUS_LABELS[newStatus]}" com sucesso.`, "success")
      if (oldReport?.status === "OPEN" && newStatus !== "OPEN") {
        setTotalElements((value) => Math.max(0, value - 1))
      }
      setRefreshKey((k) => k + 1)
    } catch {
      showToast("Não foi possível atualizar o status da denúncia.", "error")
    } finally {
      setUpdatingReportId(null)
    }
  }

  function handleStatusFilterChange(value: NpoReportStatus) {
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
            Denúncias de ONGs
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Acompanhe, filtre e atualize os relatos recebidos no painel administrativo.
          </p>
        </header>

        <section aria-labelledby="denuncias-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="denuncias-title" className="text-xl font-bold text-vinculo-dark">
                Denúncias
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {totalElements} pendência{totalElements !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-1" role="tablist" aria-label="Filtrar por status">
              {REPORT_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-vinculo-dark text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {REPORT_STATUS_LABELS[status]}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Filtrar por ONG"
                value={npoNameFilter}
                onChange={(event) => setNpoNameFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
              <input
                type="text"
                placeholder="Filtrar por empresa"
                value={companyNameFilter}
                onChange={(event) => setCompanyNameFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
            </div>
          </div>

          <div className="mt-2">
            {isLoadingReports && <p className="text-sm text-slate-600">Carregando denúncias...</p>}

            {!isLoadingReports && reportsError && (
              <p className="text-sm font-medium text-vinculo-red" role="alert">
                {reportsError}
              </p>
            )}

            {!isLoadingReports && !reportsError && reports.length === 0 && (
              <p className="text-sm text-slate-600">
                {statusFilter === "OPEN" && "Nenhuma denúncia aberta."}
                {statusFilter === "RESOLVED" && "Nenhuma denúncia resolvida."}
                {statusFilter === "DISMISSED" && "Nenhuma denúncia descartada."}
              </p>
            )}

            {!isLoadingReports && !reportsError && reports.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th scope="col" className="py-3 pl-4 pr-4 font-semibold">
                        ONG
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Empresa
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Motivo
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="py-3 pl-4 pr-4 font-semibold">
                        Recebida em
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="align-top text-slate-700">
                        <td className="py-4 pl-4 pr-4">
                          <p className="font-semibold text-vinculo-dark">{report.npo.name}</p>
                          {report.npo.email && (
                            <p className="mt-1 text-xs text-slate-500">{report.npo.email}</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">
                            {report.reporterCompany.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {report.reporterUser.email}
                          </p>
                        </td>
                        <td className="max-w-md px-4 py-4 leading-6">{report.reason}</td>
                        <td className="px-4 py-4">
                          <select
                            aria-label={`Alterar status da denúncia ${report.id}`}
                            value={report.status}
                            disabled={updatingReportId === report.id}
                            onChange={(event) =>
                              void handleStatusChange(
                                report.id,
                                event.target.value as NpoReportStatus,
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20 disabled:opacity-60"
                          >
                            {REPORT_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {REPORT_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 pl-4 pr-4 text-slate-500">
                          {formatReportDate(report.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
