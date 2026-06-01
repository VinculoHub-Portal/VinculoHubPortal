import { useAuth0 } from "@auth0/auth0-react";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { useEffect, useState } from "react";
import { fetchAllCompanies, fetchAllNpos } from "../../api/admin";
import {
  fetchAdminNpoReports,
  updateAdminNpoReportStatus,
  type NpoReportResponse,
  type NpoReportStatus,
} from "../../api/npoReports";
import { CreateNoticeModal } from "../../announcement/CreateAnnouncementModal";
import { FlexibleButton } from "../../components/general/FlexibleButton";
import { Header } from "../../components/general/Header";
import { MetricCard } from "../../components/general/MetricCard";
import { useToast } from "../../context/ToastContext";
import { downloadCsv } from "../../utils/exportCsv";

const PAGE_SIZE = 5;

const dashboardMetrics = [
  {
    label: "Total de ONGs",
    value: 87,
    description: "Cadastradas no sistema",
    icon: <CorporateFareOutlinedIcon fontSize="small" />,
    variant: "brand" as const,
    href: "/admin/ongs",
  },
  {
    label: "Editais Publicados",
    value: 24,
    description: "Ativos no mural",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    variant: "success" as const,
    href: "/editais",
  },
  {
    label: "Vínculos Ativos",
    value: 156,
    description: "Empresas e ONGs conectadas",
    icon: <HubOutlinedIcon fontSize="small" />,
    variant: "accent" as const,
    href: "/admin/vinculos",
  },
  {
    label: "Notificações Pendentes",
    value: 5,
    description: "Mediações necessárias",
    icon: <PendingActionsOutlinedIcon fontSize="small" />,
    variant: "warning" as const,
    href: "/admin/notificacoes",
  },
];

const NPO_HEADERS = {
  id: "ID",
  name: "Nome",
  cnpj: "CNPJ",
  cpf: "CPF",
  phone: "Telefone",
  npoSize: "Porte",
  environmental: "Ambiental",
  social: "Social",
  governance: "Governança",
  city: "Cidade",
  state: "Estado",
  zipCode: "CEP",
  createdAt: "Data de Cadastro",
}

const COMPANY_HEADERS = {
  id: "ID",
  legalName: "Razão Social",
  socialName: "Nome Fantasia",
  cnpj: "CNPJ",
  phone: "Telefone",
  email: "E-mail",
  city: "Cidade",
  state: "Estado",
  zipCode: "CEP",
  createdAt: "Data de Cadastro",
}

const REPORT_STATUS_LABELS: Record<NpoReportResponse["status"], string> = {
  OPEN: "Aberta",
  RESOLVED: "Resolvida",
  DISMISSED: "Descartada",
};

const REPORT_STATUS_OPTIONS: NpoReportStatus[] = ["OPEN", "RESOLVED", "DISMISSED"];

function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function AdminDashboard() {
  const { getAccessTokenSilently } = useAuth0();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [reports, setReports] = useState<NpoReportResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openReportsCount, setOpenReportsCount] = useState(0);
  const [npoNameFilter, setNpoNameFilter] = useState("");
  const [companyNameFilter, setCompanyNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<NpoReportStatus>("OPEN");
  const [debouncedNpoName, setDebouncedNpoName] = useState("");
  const [debouncedCompanyName, setDebouncedCompanyName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNpoName(npoNameFilter);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [npoNameFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyName(companyNameFilter);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [companyNameFilter]);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      setIsLoadingReports(true);
      setReportsError("");
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchAdminNpoReports(token, {
          npoName: debouncedNpoName || undefined,
          companyName: debouncedCompanyName || undefined,
          status: statusFilter,
          page,
          size: PAGE_SIZE,
        });
        if (isMounted) {
          setReports(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          if (statusFilter === "OPEN") setOpenReportsCount(data.totalElements);
        }
      } catch {
        if (isMounted) {
          setReportsError("Não foi possível carregar as denúncias.");
          setReports([]);
        }
      } finally {
        if (isMounted) setIsLoadingReports(false);
      }
    }

    void loadReports();

    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently, debouncedNpoName, debouncedCompanyName, statusFilter, page, refreshKey]);

  async function handleExport() {
    setExporting(true);
    try {
      const token = await getAccessTokenSilently();
      const [npos, companies] = await Promise.all([fetchAllNpos(token), fetchAllCompanies(token)]);
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(`ongs_${date}.csv`, npos, NPO_HEADERS);
      downloadCsv(`empresas_${date}.csv`, companies, COMPANY_HEADERS);
    } finally {
      setExporting(false);
    }
  }

  async function handleStatusChange(reportId: number, newStatus: NpoReportStatus) {
    setUpdatingReportId(reportId);
    const oldReport = reports.find((r) => r.id === reportId);
    try {
      const token = await getAccessTokenSilently();
      await updateAdminNpoReportStatus(reportId, { status: newStatus }, token);
      if (oldReport?.status === "OPEN" && newStatus !== "OPEN") {
        setOpenReportsCount((c) => Math.max(0, c - 1));
      } else if (oldReport?.status !== "OPEN" && newStatus === "OPEN") {
        setOpenReportsCount((c) => c + 1);
      }
      showToast(`Status atualizado para "${REPORT_STATUS_LABELS[newStatus]}" com sucesso.`, "success");
      setRefreshKey((k) => k + 1);
    } catch {
      showToast("Não foi possível atualizar o status da denúncia.", "error");
    } finally {
      setUpdatingReportId(null);
    }
  }

  function handleStatusFilterChange(value: NpoReportStatus) {
    setStatusFilter(value);
    setPage(0);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between align-middle">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight text-vinculo-dark sm:text-4xl">
              Painel administrativo
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Gerencie usuários, organizações e configurações da plataforma.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-3 lg:flex-nowrap">
            <FlexibleButton
              icon={<InsertDriveFileOutlinedIcon fontSize="small" />}
              variant="secondary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Cadastrar Edital
            </FlexibleButton>

            <FlexibleButton
              icon={<FileDownloadOutlinedIcon fontSize="small" />}
              variant="outline"
              onClick={() => void handleExport()}
              disabled={exporting}
            >
              {exporting ? "Exportando..." : "Exportar Dados"}
            </FlexibleButton>

            <FlexibleButton
              icon={<AccessTimeOutlinedIcon fontSize="small" />}
              variant="attention"
              onClick={() => {
                document.getElementById("denuncias")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Ver Denúncias
            </FlexibleButton>

            <FlexibleButton
              icon={<ReportProblemOutlinedIcon fontSize="small" />}
              variant="warning"
              onClick={() => {
                document.getElementById("mediacoes")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Mediações
            </FlexibleButton>
          </div>
        </header>

        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label="Métricas do dashboard"
        >
          {dashboardMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              variant={metric.variant}
              href={metric.href}
            />
          ))}
        </section>

        <section
          id="denuncias"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="denuncias-title"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="denuncias-title" className="text-xl font-bold text-vinculo-dark">
                Denúncias de ONGs
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Acompanhe suspeitas reportadas por empresas para análise administrativa.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-vinculo-red/10 px-3 py-1 text-sm font-semibold text-vinculo-red">
              {openReportsCount} pendentes
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex gap-1" role="tablist" aria-label="Filtrar por status">
              {REPORT_STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={statusFilter === s}
                  onClick={() => handleStatusFilterChange(s)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-vinculo-dark text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {REPORT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Filtrar por ONG"
                value={npoNameFilter}
                onChange={(e) => setNpoNameFilter(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
              <input
                type="text"
                placeholder="Filtrar por empresa"
                value={companyNameFilter}
                onChange={(e) => setCompanyNameFilter(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
              />
            </div>
          </div>

          <div className="mt-6">
            {isLoadingReports && (
              <p className="text-sm text-slate-600">Carregando denúncias...</p>
            )}

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
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead>
                      <tr className="text-slate-500">
                        <th scope="col" className="py-3 pr-4 font-semibold">
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
                        <th scope="col" className="py-3 pl-4 font-semibold">
                          Recebida em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((report) => (
                        <tr key={report.id} className="align-top text-slate-700">
                          <td className="py-4 pr-4">
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
                              {REPORT_STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {REPORT_STATUS_LABELS[s]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 pl-4 text-slate-500">
                            {formatReportDate(report.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>{totalElements} resultado{totalElements !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Anterior
                    </button>
                    <span>
                      Página {page + 1} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </main>

      <CreateNoticeModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
