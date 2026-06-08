import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "../../styles/main.css"
import type { NpoProfileResponse } from "../../api/npo"
import { OrganizationInfoCard } from "../OngProfilePage/OrganizationInfoCard"
import { ProfileHeaderCard } from "../OngProfilePage/ProfileHeaderCard"
import { ResponsibleCard } from "../OngProfilePage/ResponsibleCard"
import { PublicProjectsSection } from "./PublicProjectsSection"

const mockProfile: NpoProfileResponse = {
  viewerContext: "EXTERNAL",
  institutionalData: {
    id: 42,
    name: "Instituto Caminhos do Saber",
    description:
      "Organização social dedicada a ampliar o acesso à educação, cultura e tecnologia para jovens em situação de vulnerabilidade.",
    logoUrl: null,
    npoSize: "medium",
    cnpj: "12.345.678/0001-90",
    cpf: null,
    environmental: false,
    social: true,
    governance: true,
  },
  contact: {
    email: "contato@caminhosdosaber.org.br",
    phone: "(51) 3333-2026",
  },
  address: {
    id: 1,
    state: "Rio Grande do Sul",
    stateCode: "RS",
    city: "Porto Alegre",
    street: "Rua da Cidadania",
    number: "120",
    complement: "Sala 304",
    zipCode: "90000-000",
  },
  responsible: {
    id: 7,
    name: "Mariana Costa",
    email: "mariana@caminhosdosaber.org.br",
    auth0Id: "preview|npo-owner",
    userType: "npo",
  },
  projects: [
    {
      id: 100,
      title: "Laboratório Jovem de Tecnologia",
      description: "Oficinas de programação, robótica e cultura maker no contraturno escolar.",
      status: "ACTIVE",
      type: "SOCIAL_INVESTMENT_LAW",
      budgetNeeded: 85000,
      investedAmount: 22000,
      ods: [
        {
          id: 4,
          name: "Educação de Qualidade",
          description: "Garantir educação inclusiva, equitativa e de qualidade.",
        },
        {
          id: 9,
          name: "Indústria, Inovação e Infraestrutura",
          description: "Promover inovação e infraestrutura resiliente.",
        },
      ],
      startDate: "2026-02-01",
      endDate: "2026-12-15",
      focusArea: "Educação",
      fundraisingDeadline: "2026-08-30",
      beneficiariesCount: 180,
      location: "Porto Alegre, RS",
      mainObjective: "Formar jovens para oportunidades em tecnologia.",
    },
    {
      id: 101,
      title: "Biblioteca Comunitária Aberta",
      description: "Mediação de leitura, acervo circulante e encontros culturais para famílias.",
      status: "COMPLETED",
      type: "TAX_INCENTIVE_LAW",
      budgetNeeded: 42000,
      investedAmount: 42000,
      ods: [
        {
          id: 4,
          name: "Educação de Qualidade",
          description: "Garantir educação inclusiva, equitativa e de qualidade.",
        },
        {
          id: 10,
          name: "Redução das Desigualdades",
          description: "Reduzir desigualdades dentro dos países e entre eles.",
        },
      ],
      startDate: "2025-03-10",
      endDate: "2025-11-20",
      focusArea: "Cultura",
      fundraisingDeadline: "2025-06-15",
      beneficiariesCount: 320,
      location: "Porto Alegre, RS",
      mainObjective: "Aproximar a comunidade da leitura e da cultura.",
    },
    {
      id: 102,
      title: "Trilhas de Empregabilidade",
      description: "Mentorias e preparação profissional para jovens no primeiro emprego.",
      status: "ACTIVE",
      type: "SOCIAL_INVESTMENT_LAW",
      budgetNeeded: 56000,
      investedAmount: 14000,
      ods: [
        {
          id: 8,
          name: "Trabalho Decente e Crescimento Econômico",
          description: "Promover crescimento econômico sustentado e trabalho decente.",
        },
      ],
      startDate: "2026-04-05",
      endDate: null,
      focusArea: "Empregabilidade",
      fundraisingDeadline: "2026-10-01",
      beneficiariesCount: 90,
      location: "Porto Alegre, RS",
      mainObjective: "Apoiar jovens na transição para o mercado de trabalho.",
    },
  ],
}

function MockPublicProfilePreview() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <header className="bg-vinculo-dark px-6 py-4 shadow-md">
        <span className="text-xl font-bold text-white">
          VinculoHub<span className="text-vinculo-green">Portal</span>
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
        <ProfileHeaderCard
          institutionalData={mockProfile.institutionalData}
          editable={false}
          isEditing={false}
        />

        <OrganizationInfoCard
          institutionalData={mockProfile.institutionalData}
          contact={mockProfile.contact}
          address={mockProfile.address}
          isEditing={false}
        />

        <ResponsibleCard responsible={mockProfile.responsible} isEditing={false} />

        <PublicProjectsSection projects={mockProfile.projects} />
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MockPublicProfilePreview />
  </StrictMode>,
)
