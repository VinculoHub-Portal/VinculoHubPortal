import { FeatureCard } from "./FeatureCard"
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"

export default function InfoTab() {
  return (
    <div className="h-screen bg-surface flex flex-col">
      <main className="flex flex-col items-center text-center px-6">
        <h1 className="text-5xl font-bold text-vinculo-dark mb-6">
          Plataforma Completa de Gestão
        </h1>
        <div className="w-32 h-1 bg-vinculo-green ml-3 mb-8"></div>
        <p className="max-w-3xl text-slate-600 text-lg md:text-xl leading-relaxed">
          A Vínculo é uma solução completa que integra capacitação e ferramentas
          de gestão para organizações sociais e empresas comprometidas com
          impacto social.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 w-full max-w-6xl text-left mb-28 md:mb-0">
          <FeatureCard
            title="Para ONGs e OSCs"
            description="Simplifique a gestão da sua organização com ferramentas integradas para:"
            icon={
              <GroupsOutlinedIcon
                className="text-white"
                style={{ fontSize: 30 }}
              />
            }
            theme="ong"
            items={[
              "Gestão de projetos e atividades diárias",
              "Controle financeiro e prestação de contas",
              "Gestão de voluntários e equipe",
              "Captação de recursos e relacionamento com doadores",
              "Medição e relatórios de impacto",
            ]}
          />
          <FeatureCard
            title="Para Empresas"
            description="Gerencie suas iniciativas de responsabilidade social com eficiência:"
            icon={
              <AssignmentOutlinedIcon
                className="text-white"
                style={{ fontSize: 25 }}
              />
            }
            theme="empresa"
            items={[
              "Gestão de programas de investimento social",
              "Monitoramento de projetos apoiados",
              "Engajamento de colaboradores em voluntariado",
              "Relatórios de impacto ESG",
              "Conexão com organizações alinhadas aos valores da empresa",
            ]}
          />
        </div>
      </main>
    </div>
  )
}
