import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Link } from "react-router-dom"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"
import { usePaginatedProjects } from "../../hooks/usePaginatedProjects"
import { useProjectDetailsNavigation } from "../ProjectDetailsPage/projectDetailsNavigation"
import { HowItWorksSection } from "./HowItWorksSection"
import { ProjectsGrid } from "./ProjectsGrid"

export const CompanyPrivateInvestmentPage = () => {
  const openProjectDetails = useProjectDetailsNavigation("/empresa/investimento-social-privado")
  const { projects, loading, error, currentPage, totalPages, totalElements, setCurrentPage } =
    usePaginatedProjects({ type: "SOCIAL_INVESTMENT_LAW" })

  function handlePageChange(page: number) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-6 sm:gap-10 pb-12 sm:pb-20">
      <Header />
      <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        <Link
          to="/empresa/dashboard"
          className="flex items-center gap-1 text-sm text-vinculo-dark font-medium hover:opacity-70 transition-opacity w-fit"
        >
          <ChevronLeftIcon fontSize="small" />
          Voltar ao Dashboard
        </Link>

        <header className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-medium leading-tight sm:leading-9 text-vinculo-dark">
            Investimento Social Privado
          </h1>
          <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-500 max-w-[600px]">
            Explore projetos sociais alinhados aos valores e objetivos da sua empresa, com sugestões baseadas nos temas de interesse cadastrados.
          </p>
        </header>

        <div className="mt-4 sm:mt-6">
          <ProjectsGrid
            projects={projects}
            totalElements={totalElements}
            loading={loading}
            error={error}
            onDetails={openProjectDetails}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={handlePageChange}
        />

        <HowItWorksSection />
      </main>
    </div>
  )
}
