import { useAuth0 } from "@auth0/auth0-react"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { fetchProjects, type ProjectListItem } from "../../api/projects"
import { Header } from "../../components/general/Header"
import { HowItWorksSection } from "./HowItWorksSection"
import { InterestThemesFilter } from "./InterestThemesFilter"
import { ProjectsGrid } from "./ProjectsGrid"
import { StatCardsRow } from "./StatCardsRow"
import { SuggestedProjectsBanner } from "./SuggestedProjectsBanner"
import {
  countProjectsByTheme,
  enrichProjectWithMocks,
  type ThemeId,
} from "./mockData"

export const CompanyPrivateInvestmentPage = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedThemes, setSelectedThemes] = useState<Set<ThemeId>>(new Set())

  // Para demonstração com dados mockados: comente o useEffect abaixo.
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
        setTotalElements(data.totalElements)
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

  // Para demonstração com dados mockados: comente a linha abaixo e descomente a seguinte.
  const enriched = useMemo(
    () => projects.map(enrichProjectWithMocks),
    [projects],
  )
  // const enriched = MOCK_PROJECTS

  const filtered = useMemo(() => {
    if (selectedThemes.size === 0) return enriched
    return enriched.filter((p) => p.themes.some((t) => selectedThemes.has(t)))
  }, [enriched, selectedThemes])

  const themeCounts = useMemo(() => countProjectsByTheme(enriched), [enriched])

  const toggleTheme = (id: ThemeId) => {
    setSelectedThemes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
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
            Investimento Social Privado
          </h1>
          <p className="text-base font-normal leading-6 text-slate-600 max-w-xl">
            Invista diretamente em projetos sociais alinhados com os valores e
            objetivos da sua empresa. Projetos sugeridos com base nos seus temas
            de interesse cadastrados.
          </p>
        </header>

        {/* Para demonstração: trocar `totalElements` por `MOCK_PROJECTS.length` e `loading` por `false` */}
        <StatCardsRow projectCount={totalElements} loading={loading} />

        <InterestThemesFilter
          selected={selectedThemes}
          onToggle={toggleTheme}
          counts={themeCounts}
        />

        <SuggestedProjectsBanner projectCount={filtered.length} />

        {/* Para demonstração: trocar `loading` por `false` e `error` por `null` */}
        <ProjectsGrid projects={filtered} loading={loading} error={error} />

        <HowItWorksSection />
      </main>
    </div>
  )
}
