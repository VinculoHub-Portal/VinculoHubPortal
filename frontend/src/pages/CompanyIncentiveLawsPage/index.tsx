import { useAuth0 } from "@auth0/auth0-react"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchProjects, type ProjectListItem } from "../../api/projects"
import { Header } from "../../components/general/Header"
import { useProjectDetailsNavigation } from "../ProjectDetailsPage/projectDetailsNavigation"
import { ProjectsGrid } from "./ProjectsGrid"

export const CompanyIncentiveLawsPage = () => {
  const { getAccessTokenSilently } = useAuth0()
  const openProjectDetails = useProjectDetailsNavigation("/empresa/leis-de-incentivo")
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const data = await fetchProjects(
          { type: "TAX_INCENTIVE_LAW", size: 50 },
          token,
        )
        if (cancelled) return
        setProjects(data.content)
        setError(null)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erro ao carregar projetos")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently])

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
      </main>
    </div>
  )
}
