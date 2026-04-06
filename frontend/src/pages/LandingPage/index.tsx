import { UsersIcon } from "../../components/general/UsersIcon"
import { ClipboardIcon } from "../../components/general/ClipboardIcon"
import { FeatureCard } from "../../components/general/FeatureCard"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col pb-20">
      <main className="flex flex-col items-center text-center px-6 mt-16 md:mt-24">
        <h1 className="text-[48px] font-bold text-vinculo-dark mb-6">
          Plataforma Completa de Gestão
        </h1>
        <div className="w-32 h-1 bg-vinculo-green ml-3 mb-8"></div>
        <p className="max-w-3xl text-slate-600 text-[18px] md:text-xl leading-relaxed">
          A Vínculo é uma solução completa que integra capacitação e 
          ferramentas de gestão para organizações sociais e empresas comprometidas com impacto social.
        </p>
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 w-full max-w-6xl text-left">
          <FeatureCard
            title="Para ONGs e OSCs"
            description="Simplifique a gestão da sua organização com ferramentas integradas para:"
            icon={<UsersIcon className="size-7 text-white" />}
            theme="ong"
            items={[
              "Gestão de projetos e atividades diárias",
              "Controle financeiro e prestação de contas",
              "Gestão de voluntários e equipe",
              "Captação de recursos e relacionamento com doadores",
              "Medição e relatórios de impacto"
            ]}
          />
          <FeatureCard
            title="Para Empresas"
            description="Gerencie suas iniciativas de responsabilidade social com eficiência:"
            icon={<ClipboardIcon className="size-7 text-white" />}
            theme="empresa"
            items={[
              "Gestão de programas de investimento social",
              "Monitoramento de projetos apoiados",
              "Engajamento de colaboradores em voluntariado",
              "Relatórios de impacto ESG",
              "Conexão com organizações alinhadas aos valores da empresa"
            ]}
          />
        </div>
      </main>
    </div>
  );
}
