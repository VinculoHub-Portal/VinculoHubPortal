import { useAuth0 } from "@auth0/auth0-react"
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"
import HubOutlinedIcon from "@mui/icons-material/HubOutlined"
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import { useEffect, useState } from "react"
import {
  fetchOverdueRelationshipAlerts,
  type OverdueRelationshipAlert,
} from "../../api/admin"
import {
  fetchAdminNpoReports,
  type NpoReportResponse,
} from "../../api/npoReports"
import { AdminReportDetailModal } from "../../components/admin/AdminReportDetailModal"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"

type ActiveTab = "reports" | "relationships"

const PAGE_SIZE = 10

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function AdminNotificationsPage() {
  const { getAccessTokenSilently } = useAuth0()

  const [activeTab, setActiveTab] = useState<ActiveTab>("reports")

  const [reports, setReports] = useState<NpoReportResponse[]>([])
  const [reportsTotalPages, setReportsTotalPages] = useState(0)
  const [reportsTotalElements, setReportsTotalElements] = useState(0)
  const [reportsPage, setReportsPage] = useState(0)
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState("")
  const [selectedReport, setSelectedReport] = useState<NpoReportResponse | null>(null)

  const [relationships, setRelationships] = useState<OverdueRelationshipAlert[]>([])
  const [relationshipsTotalPages, setRelationshipsTotalPages] = useState(0)
  const [relationshipsTotalElements, setRelationshipsTotalElements] = useState(0)
  const [relationshipsPage, setRelationshipsPage] = useState(0)
  const [relationshipsLoading, setRelationshipsLoading] = useState(true)
  const [relationshipsError, setRelationshipsError] = useState("")

  useEffect(() => {
    let isMounted = true
    setReportsLoading(true)
    setReportsError("")

    getAccessTokenSilently()
      .then((token) =>
        fetchAdminNpoReports(token, { status: "OPEN", page: reportsPage, size: PAGE_SIZE }),
      )
      .then((data) => {
        if (!isMounted) return
        setReports(data.content)
        setReportsTotalPages(data.totalPages)
        setReportsTotalElements(data.totalElements)
      })
      .catch(() => {
        if (isMounted) setReportsError("Não foi possível carregar as denúncias.")
      })
      .finally(() => {
        if (isMounted) setReportsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [getAccessTokenSilently, reportsPage])

  useEffect(() => {
    let isMounted = true
    setRelationshipsLoading(true)
    setRelationshipsError("")

    getAccessTokenSilently()
      .then((token) =>
        fetchOverdueRelationshipAlerts(token, { page: relationshipsPage, size: PAGE_SIZE }),
      )
      .then((data) => {
        if (!isMounted) return
        setRelationships(data.content)
        setRelationshipsTotalPages(data.totalPages)
        setRelationshipsTotalElements(data.totalElements)
      })
      .catch(() => {
        if (isMounted) setRelationshipsError("Não foi possível carregar os vínculos vencidos.")
      })
      .finally(() => {
        if (isMounted) setRelationshipsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [getAccessTokenSilently, relationshipsPage])

  const totalNotifications = reportsTotalElements + relationshipsTotalElements
  const totalLoading = reportsLoading && relationshipsLoading

  function handleReportStatusChanged(updated: NpoReportResponse) {
    if (updated.status !== "OPEN") {
      setReports((prev) => prev.filter((r) => r.id !== updated.id))
      setReportsTotalElements((prev) => Math.max(0, prev - 1))
    } else {
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4">
          <a
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-vinculo-dark"
          >
            <ArrowBackOutlinedIcon fontSize="small" />
            Voltar ao painel
          </a>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <NotificationsActiveOutlinedIcon fontSize="small" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-vinculo-dark">Notificações</h1>
              <p className="text-sm text-slate-500">
                {totalLoading
                  ? "Carregando..."
                  : `${totalNotifications} evento${totalNotifications !== 1 ? "s" : ""} pendente${totalNotifications !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Resumo de notificações">
          <SummaryCard label="Denúncias abertas" value={reportsTotalElements} />
          <SummaryCard label="Vínculos vencidos" value={relationshipsTotalElements} />
        </section>

        <div className="flex gap-2 border-b border-slate-200" role="tablist" aria-label="Tipo de notificação">
          <TabButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            icon={<ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Denúncias"
            count={reportsTotalElements}
          />
          <TabButton
            active={activeTab === "relationships"}
            onClick={() => setActiveTab("relationships")}
            icon={<HubOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Vínculos vencidos"
            count={relationshipsTotalElements}
          />
        </div>

        {activeTab === "reports" && (
          <NotificationTable
            loading={reportsLoading}
            error={reportsError}
            isEmpty={reports.length === 0}
            emptyMessage="Nenhuma denúncia aberta."
            currentPage={reportsPage}
            totalPages={reportsTotalPages}
            onPageChange={setReportsPage}
          >
            {reports.map((report) => (
              <tr key={report.id} className="text-slate-700 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    report.status === "OPEN"
                      ? "bg-red-100 text-red-700"
                      : report.status === "RESOLVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                  }`}>
                    <ReportProblemOutlinedIcon sx={{ fontSize: 14 }} aria-hidden />
                    {report.status === "OPEN" ? "Aberta" : report.status === "RESOLVED" ? "Resolvida" : "Descartada"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-vinculo-dark">{report.npo.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{report.reporterCompany.name}</p>
                </td>
                <td className="max-w-md px-4 py-4 leading-6 text-slate-600 line-clamp-2">{report.reason}</td>
                <td className="px-4 py-4 text-slate-500">{formatDate(report.createdAt)}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="text-sm font-semibold text-vinculo-dark hover:underline"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </NotificationTable>
        )}

        {activeTab === "relationships" && (
          <NotificationTable
            loading={relationshipsLoading}
            error={relationshipsError}
            isEmpty={relationships.length === 0}
            emptyMessage="Nenhum vínculo vencido."
            currentPage={relationshipsPage}
            totalPages={relationshipsTotalPages}
            onPageChange={setRelationshipsPage}
          >
            {relationships.map((alert) => (
              <tr
                key={`${alert.companyId}-${alert.projectId}`}
                className="text-slate-700 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <HubOutlinedIcon sx={{ fontSize: 14 }} aria-hidden />
                    Vínculo pendente vencido
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-vinculo-dark">{alert.projectName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {alert.companyName} → {alert.npoName}
                  </p>
                </td>
                <td className="max-w-md px-4 py-4 leading-6">
                  A solicitação está pendente há mais de 7 dias e pode exigir mediação.
                </td>
                <td className="px-4 py-4 text-slate-500">{formatDate(alert.requestedAt)}</td>
                <td className="px-4 py-4">
                  <a
                    href="/admin/vinculos"
                    className="text-sm font-semibold text-vinculo-dark hover:underline"
                  >
                    Ver detalhes
                  </a>
                </td>
              </tr>
            ))}
          </NotificationTable>
        )}
      </main>

      {selectedReport && (
        <AdminReportDetailModal
          report={selectedReport}
          open={selectedReport !== null}
          onClose={() => setSelectedReport(null)}
          onStatusChanged={handleReportStatusChanged}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-vinculo-dark text-vinculo-dark"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? "bg-vinculo-dark text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function NotificationTable({
  loading,
  error,
  isEmpty,
  emptyMessage,
  currentPage,
  totalPages,
  onPageChange,
  children,
}: {
  loading: boolean
  error: string
  isEmpty: boolean
  emptyMessage: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading && (
        <div className="p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="p-6 text-sm font-medium text-vinculo-red" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && isEmpty && (
        <p className="p-6 text-sm text-slate-500">{emptyMessage}</p>
      )}

      {!loading && !error && !isEmpty && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  <th scope="col" className="px-6 py-3 font-semibold">Tipo</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Origem</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Detalhes</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Recebida em</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">{children}</tbody>
            </table>
          </div>

          <div className="border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={onPageChange}
            />
          </div>
        </>
      )}
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-vinculo-dark">{value}</p>
    </article>
  )
}
