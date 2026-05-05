import { useAuth0 } from "@auth0/auth0-react"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { fetchProjects, type ProjectListItem } from "../../api/projects"
import { Header } from "../../components/general/Header"
import { useProjectDetailsNavigation } from "../ProjectDetailsPage/projectDetailsNavigation"
import { HowItWorksSection } from "./HowItWorksSection"
import { ProjectsGrid } from "./ProjectsGrid"

export const CompanyPrivateInvestmentPage = () => {
  const { getAccessTokenSilently } = useAuth0()
  const openProjectDetails = useProjectDetailsNavigation("/empresa/investimento-social-privado")
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
          { type: "SOCIAL_INVESTMENT_LAW", size: 50 },
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
            Investimento Social Privado
          </h1>
          <p className="text-base font-normal leading-6 text-slate-600 max-w-xl">
            Invista diretamente em projetos sociais alinhados com os valores e
            objetivos da sua empresa. Projetos sugeridos com base nos seus temas
            de interesse cadastrados.
          </p>
        </header>

        <ProjectsGrid
          projects={projects}
          loading={loading}
          error={error}
          onDetails={openProjectDetails}
        />

        <HowItWorksSection />
      </main>
    </div>
  )
}
