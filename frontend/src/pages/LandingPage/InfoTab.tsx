import { FeatureCard } from "./FeatureCard"
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"

export function InfoTab() {
  return (
    <section className="bg-slate-50 py-14 md:py-20">
      <main className="mx-auto flex flex-col items-center text-center px-4 sm:px-6 max-w-[1360px]">
        <h2
          id="sobre-nos"
          className="text-[30px] sm:text-4xl md:text-5xl font-bold text-vinculo-dark mb-4 sm:mb-6"
        >
          Plataforma Completa de Gestão
        </h2>
        <div className="w-24 sm:w-32 h-1 bg-vinculo-green ml-3 mb-6 sm:mb-8"></div>
        <p className="max-w-2xl text-slate-600 text-base md:text-xl leading-relaxed">
          A Vínculo é uma solução completa que integra capacitação e ferramentas
          de gestão para organizações sociais e empresas comprometidas com
          impacto social.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 md:mt-14 w-full max-w-5xl text-left">
          <FeatureCard
            title="Para ONGs e OSCs"
            description="Simplifique a gestão da sua organização com ferramentas integradas para:"
            icon={
              <GroupsOutlinedIcon
                className="text-white"
                style={{ fontSize: 26 }}
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
                style={{ fontSize: 22 }}
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
    </section>
  )
}
