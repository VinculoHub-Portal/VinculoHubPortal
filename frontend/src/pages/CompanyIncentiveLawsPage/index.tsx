import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Link } from "react-router-dom"
import { Header } from "../../components/general/Header"
import { Pagination } from "../../components/general/Pagination"
import { usePaginatedProjects } from "../../hooks/usePaginatedProjects"
import { useProjectDetailsNavigation } from "../ProjectDetailsPage/projectDetailsNavigation"
import { ProjectsGrid } from "./ProjectsGrid"

export const CompanyIncentiveLawsPage = () => {
  const openProjectDetails = useProjectDetailsNavigation("/empresa/leis-de-incentivo")
  const { projects, loading, error, currentPage, totalPages, setCurrentPage } =
    usePaginatedProjects({ type: "TAX_INCENTIVE_LAW" })

  function handlePageChange(page: number) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-6">
        <Link
          to="/empresa/dashboard"
          className="flex items-center gap-1 text-sm text-vinculo-dark font-medium hover:opacity-70 transition-opacity w-fit"
        >
          <ChevronLeftIcon fontSize="small" />
          Voltar ao Dashboard
        </Link>

        <header>
          <h1 className="text-2xl font-medium leading-9 text-vinculo-dark">
            Leis de Incentivo
          </h1>
          <p className="text-base font-normal leading-6 text-slate-600 max-w-xl">
            Explore projetos que podem ser apoiados através de leis de incentivo
            fiscal. Invista em causas sociais enquanto obtém benefícios
            tributários para sua empresa.
          </p>
        </header>

        <ProjectsGrid
          projects={projects}
          loading={loading}
          error={error}
          onDetails={openProjectDetails}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      </main>
    </div>
  )
}
