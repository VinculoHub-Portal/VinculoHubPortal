import { useAuth0 } from "@auth0/auth0-react"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { fetchProjects, type ProjectListItem } from "../../api/projects"
import { Header } from "../../components/general/Header"
import { IncentiveLawFilter } from "./IncentiveLawFilter"
import { ProjectsGrid } from "./ProjectsGrid"
import { StatCardsRow } from "./StatCardsRow"
import { enrichProjectWithMocks, type IncentiveLawId } from "./mockData"

export const CompanyIncentiveLawsPage = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLawId, setSelectedLawId] = useState<IncentiveLawId>("todas")

  // Para demonstração com dados mockados: comente o useEffect abaixo.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const data = await fetchProjects({ type: "TAX_INCENTIVE_LAW", size: 50 }, token)
        if (cancelled) return
        setProjects(data.content)
        setTotalElements(data.totalElements)
        setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar projetos")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [getAccessTokenSilently])

  // Para demonstração com dados mockados: comente a linha abaixo e descomente a seguinte.
  const enriched = useMemo(() => projects.map(enrichProjectWithMocks), [projects])
  // const enriched = MOCK_PROJECTS

  const filtered = useMemo(
    () =>
      selectedLawId === "todas"
        ? enriched
        : enriched.filter((p) => p.lawId === selectedLawId),
    [enriched, selectedLawId],
  )

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
            Explore projetos que podem ser apoiados através de leis de incentivo fiscal. Invista em
            causas sociais enquanto obtém benefícios tributários para sua empresa.
          </p>
        </header>

        {/* Para demonstração: trocar `totalElements` por `MOCK_PROJECTS.length` e `loading` por `false` */}
        <StatCardsRow projectCount={totalElements} loading={loading} />

        <IncentiveLawFilter selected={selectedLawId} onChange={setSelectedLawId} />

        {/* Para demonstração: trocar `loading` por `false` e `error` por `null` */}
        <ProjectsGrid projects={filtered} loading={loading} error={error} />
      </main>
    </div>
  )
}
