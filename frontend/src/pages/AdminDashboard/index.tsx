import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { BaseButton } from "../../components/general/BaseButton";
import { Header } from "../../components/general/Header";
import { MetricCard } from "../../components/general/MetricCard";

const dashboardMetrics = [
  {
    label: "Total de ONGs",
    value: 87,
    description: "Cadastradas no sistema",
    icon: <CorporateFareOutlinedIcon fontSize="small" />,
    variant: "brand" as const,
  },
  {
    label: "Editais Publicados",
    value: 24,
    description: "Ativos no mural",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    variant: "success" as const,
  },
  {
    label: "Vínculos Ativos",
    value: 156,
    description: "Empresas e ONGs conectadas",
    icon: <HubOutlinedIcon fontSize="small" />,
    variant: "accent" as const,
  },
  {
    label: "Notificações Pendentes",
    value: 5,
    description: "Mediações necessárias",
    icon: <PendingActionsOutlinedIcon fontSize="small" />,
    variant: "warning" as const,
  },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight text-vinculo-dark sm:text-4xl">
              Painel administrativo
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Gerencie usuários, organizações e configurações da plataforma.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <BaseButton
              //icon={<InsertDriveFileOutlinedIcon fontSize="small" />}
              variant="secondary"
              className="rounded-full px-6 py-3 text-sm sm:text-base"
              onClick={() => {
                document.getElementById("cadastrar-edital")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Cadastrar Edital
            </BaseButton>

            <BaseButton
              //icon={<FileDownloadOutlinedIcon fontSize="small" />}
              variant="outline"
              className="rounded-full px-6 py-3 text-sm sm:text-base"
              onClick={() => {
                document.getElementById("exportar-dados")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Exportar Dados
            </BaseButton>

            <BaseButton
              //icon={<AccessTimeOutlinedIcon fontSize="small" />}
              variant="attention"
              className="rounded-full px-6 py-3 text-sm sm:text-base"
              onClick={() => {
                document.getElementById("denuncias")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Ver Denúncias
            </BaseButton>

            <BaseButton
              //icon={<ReportProblemOutlinedIcon fontSize="small" />}
              variant="warning"
              className="rounded-full px-6 py-3 text-sm sm:text-base"
              onClick={() => {
                document.getElementById("mediacoes")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Mediações
            </BaseButton>
          </div>
        </header>

        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
            />
          ))}
        </section>
      </main>
    </div>
  );
}
