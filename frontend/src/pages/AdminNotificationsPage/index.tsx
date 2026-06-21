import { useAuth0 } from "@auth0/auth0-react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useEffect, useMemo, useState } from "react";
import {
  fetchOverdueRelationshipAlerts,
  type OverdueRelationshipAlert,
} from "../../api/admin";
import {
  fetchAdminNpoReports,
  type NpoReportResponse,
} from "../../api/npoReports";
import { Header } from "../../components/general/Header";

type NotificationType = "all" | "reports" | "relationships";

type AdminNotificationItem =
  | {
      id: string;
      type: "report";
      title: string;
      primary: string;
      secondary: string;
      description: string;
      createdAt: string;
      href: string;
    }
  | {
      id: string;
      type: "relationship";
      title: string;
      primary: string;
      secondary: string;
      description: string;
      createdAt: string;
      href: string;
    };

const FILTERS: { value: NotificationType; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "reports", label: "Denúncias" },
  { value: "relationships", label: "Vínculos vencidos" },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function mapReport(report: NpoReportResponse): AdminNotificationItem {
  return {
    id: `report-${report.id}`,
    type: "report",
    title: "Denúncia de ONG aberta",
    primary: report.npo.name,
    secondary: report.reporterCompany.name,
    description: report.reason,
    createdAt: report.createdAt,
    href: "/admin/dashboard#denuncias",
  };
}

function mapRelationship(alert: OverdueRelationshipAlert): AdminNotificationItem {
  return {
    id: `relationship-${alert.companyId}-${alert.projectId}`,
    type: "relationship",
    title: "Vínculo pendente vencido",
    primary: alert.projectName,
    secondary: `${alert.companyName} -> ${alert.npoName}`,
    description: "A solicitação está pendente há mais de 7 dias e pode exigir mediação.",
    createdAt: alert.requestedAt,
    href: "/admin/vinculos",
  };
}

export function AdminNotificationsPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [reports, setReports] = useState<NpoReportResponse[]>([]);
  const [relationships, setRelationships] = useState<OverdueRelationshipAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<NotificationType>("all");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await getAccessTokenSilently();
        const [reportsResult, overdueResult] = await Promise.allSettled([
          fetchAdminNpoReports(token, { status: "OPEN", page: 0, size: 100 }),
          fetchOverdueRelationshipAlerts(token),
        ]);

        if (isMounted) {
          const loadedReports =
            reportsResult.status === "fulfilled" ? reportsResult.value.content : [];
          const loadedRelationships =
            overdueResult.status === "fulfilled" ? overdueResult.value : [];

          setReports(loadedReports);
          setRelationships(loadedRelationships);
          if (reportsResult.status === "rejected" || overdueResult.status === "rejected") {
            setError("Algumas notificações não puderam ser carregadas.");
          }
        }
      } catch {
        if (isMounted) {
          setReports([]);
          setRelationships([]);
          setError("Não foi possível carregar as notificações.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently]);

  const notifications = useMemo(() => {
    const items = [...reports.map(mapReport), ...relationships.map(mapRelationship)];
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [relationships, reports]);

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "reports") return item.type === "report";
    if (filter === "relationships") return item.type === "relationship";
    return true;
  });

  const totalNotifications = reports.length + relationships.length;

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
                {loading
                  ? "Carregando..."
                  : `${totalNotifications} evento${totalNotifications !== 1 ? "s" : ""} pendente${totalNotifications !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar notificações">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-vinculo-dark text-white"
                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Resumo de notificações">
          <SummaryCard label="Total pendente" value={totalNotifications} />
          <SummaryCard label="Denúncias abertas" value={reports.length} />
          <SummaryCard label="Vínculos vencidos" value={relationships.length} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && (
            <div className="p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-4 h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          )}

          {!loading && error && notifications.length === 0 && (
            <p className="p-6 text-sm font-medium text-vinculo-red" role="alert">
              {error}
            </p>
          )}

          {!loading && error && notifications.length > 0 && (
            <p className="border-b border-slate-100 px-6 py-3 text-sm font-medium text-vinculo-red" role="alert">
              {error}
            </p>
          )}

          {!loading && filteredNotifications.length === 0 && notifications.length === 0 && !error && (
            <p className="p-6 text-sm text-slate-500">Nenhuma notificação encontrada.</p>
          )}

          {!loading && filteredNotifications.length === 0 && notifications.length > 0 && (
            <p className="p-6 text-sm text-slate-500">Nenhuma notificação encontrada para o filtro selecionado.</p>
          )}

          {!loading && filteredNotifications.length > 0 && (
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
                <tbody className="divide-y divide-slate-100">
                  {filteredNotifications.map((item) => (
                    <tr key={item.id} className="text-slate-700 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <NotificationBadge type={item.type} label={item.title} />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-vinculo-dark">{item.primary}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.secondary}</p>
                      </td>
                      <td className="max-w-md px-4 py-4 leading-6">{item.description}</td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-4">
                        <a
                          href={item.href}
                          className="text-sm font-semibold text-vinculo-dark hover:underline"
                        >
                          Ver detalhes
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-vinculo-dark">{value}</p>
    </article>
  );
}

function NotificationBadge({
  type,
  label,
}: {
  type: AdminNotificationItem["type"];
  label: string;
}) {
  const isReport = type === "report";
  const Icon = isReport ? ReportProblemOutlinedIcon : HubOutlinedIcon;
  const classes = isReport ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      <Icon sx={{ fontSize: 14 }} aria-hidden />
      {label}
    </span>
  );
}
