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
import { downloadCsv } from "../../utils/exportCsv";

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
  const [exporting, setExporting] = useState(false);
  const [reports, setReports] = useState<NpoReportResponse[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const openReportsCount = reports.filter((report) => report.status === "OPEN").length;

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

  async function handleStatusChange(reportId: number, status: NpoReportStatus) {
    setStatusUpdateError("");
    setUpdatingReportId(reportId);
    try {
      const token = await getAccessTokenSilently();
      const updatedReport = await updateAdminNpoReportStatus(reportId, { status }, token);
      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report,
        ),
      );
    } catch {
      setStatusUpdateError("Não foi possível atualizar o status da denúncia.");
    } finally {
      setUpdatingReportId(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      setIsLoadingReports(true);
      setReportsError("");
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchAdminNpoReports(token);
        if (isMounted) setReports(data);
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
  }, [getAccessTokenSilently]);

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

          <div className="mt-6">
            {isLoadingReports && (
              <p className="text-sm text-slate-600">Carregando denúncias...</p>
            )}

            {!isLoadingReports && reportsError && (
              <p className="text-sm font-medium text-vinculo-red" role="alert">
                {reportsError}
              </p>
            )}

            {!isLoadingReports && !reportsError && statusUpdateError && (
              <p className="mb-4 text-sm font-medium text-vinculo-red" role="alert">
                {statusUpdateError}
              </p>
            )}

            {!isLoadingReports && !reportsError && reports.length === 0 && (
              <p className="text-sm text-slate-600">Nenhuma denúncia pendente.</p>
            )}

            {!isLoadingReports && !reportsError && reports.length > 0 && (
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
                        <td className="py-4 pr-4 font-semibold text-vinculo-dark">
                          {report.npo.name}
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
                        <td className="py-4 pl-4 text-slate-500">
                          {formatReportDate(report.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
