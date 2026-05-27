import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { FlexibleButton } from "../../components/general/FlexibleButton";
import { Header } from "../../components/general/Header";
import { MetricCard } from "../../components/general/MetricCard";
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
    href: "/admin/editais",
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

export function AdminDashboard() {
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
              onClick={() => {
                document.getElementById("cadastrar-edital")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Cadastrar Edital
            </FlexibleButton>

            <FlexibleButton
              icon={<FileDownloadOutlinedIcon fontSize="small" />}
              variant="outline"
              onClick={() => {
                document.getElementById("exportar-dados")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Exportar Dados
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

      </main>
    </div>
  );
}
