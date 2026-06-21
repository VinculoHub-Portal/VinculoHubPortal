import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import {
  fetchNpoProfileProjects,
  type NpoProfileProjectPage,
} from "../../api/npo"
import { Header } from "../../components/general/Header"
import { ReportNpoModal } from "../../components/ong/ReportNpoModal"
import { useNpoProfile } from "../../hooks/useNpoProfile"
import { resolveDashboardPath } from "../../utils/dashboardPath"
import { OrganizationInfoCard } from "../OngProfilePage/OrganizationInfoCard"
import { ProfileHeaderCard } from "../OngProfilePage/ProfileHeaderCard"
import { PublicProjectsSection } from "./PublicProjectsSection"

const ROLES_CLAIM = "https://vinculohub/roles"

function isCompanyUser(user: unknown) {
  const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM]
  const roles: string[] = Array.isArray(rawRoles) ? rawRoles : []
  return roles.some((r) => String(r).toUpperCase() === "COMPANY")
}

const PROJECTS_PER_PAGE = 5
const EMPTY_PROJECTS_PAGE: NpoProfileProjectPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: PROJECTS_PER_PAGE,
  first: true,
  last: true,
}

export function OngPublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const numericId = id ? Number(id) : undefined
  const [projectPage, setProjectPage] = useState(0)
  const [projectsPage, setProjectsPage] =
    useState<NpoProfileProjectPage>(EMPTY_PROJECTS_PAGE)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const { profile, loading, error } = useNpoProfile(numericId)
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth0()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const dashboardPath = resolveDashboardPath(user)
  const canReport = !isAuthLoading && isAuthenticated && isCompanyUser(user)

  useEffect(() => {
    if (numericId === undefined || Number.isNaN(numericId)) {
      setProjectsPage(EMPTY_PROJECTS_PAGE)
      setProjectsError(null)
      return
    }

    let cancelled = false

    async function loadProjects() {
      try {
        setProjectsLoading(true)
        setProjectsError(null)
        const data = await fetchNpoProfileProjects(
          numericId!,
          projectPage,
          PROJECTS_PER_PAGE,
        )
        if (!cancelled) setProjectsPage(data)
      } catch {
        if (!cancelled) {
          setProjectsPage(EMPTY_PROJECTS_PAGE)
          setProjectsError("Não foi possível carregar os projetos desta ONG.")
        }
      } finally {
        if (!cancelled) setProjectsLoading(false)
      }
    }

    void loadProjects()

    return () => {
      cancelled = true
    }
  }, [numericId, projectPage])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
        <Header />
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
          <p className="text-sm text-slate-500">Carregando perfil...</p>
          <PublicProjectsSection loading projects={[]} />
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-vinculo-dark">Perfil não encontrado</h1>
            <p className="mt-2 text-sm text-slate-500">
              O perfil público desta organização não está disponível.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-6 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
        {!isAuthLoading && isAuthenticated && (
          <a
            href={dashboardPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-vinculo-dark hover:text-vinculo-dark-hover transition-colors"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
            Voltar ao Dashboard
          </a>
        )}

        <ProfileHeaderCard
          institutionalData={profile.institutionalData}
          editable={false}
          isEditing={false}
        />

        <OrganizationInfoCard
          institutionalData={profile.institutionalData}
          contact={profile.contact}
          address={profile.address}
          isEditing={false}
        />

        <PublicProjectsSection
          currentPage={projectsPage.number}
          error={projectsError}
          loading={projectsLoading}
          onPageChange={setProjectPage}
          projects={projectsPage.content}
          totalElements={projectsPage.totalElements}
          totalPages={projectsPage.totalPages}
        />

        {canReport && numericId != null && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <ReportProblemOutlinedIcon fontSize="small" />
              Denunciar ONG
            </button>
          </div>
        )}
      </main>

      {canReport && numericId != null && (
        <ReportNpoModal
          npoId={numericId}
          open={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  )
}
