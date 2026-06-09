import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  fetchNpoProfileProjects,
  type NpoProfileProjectPage,
} from "../../api/npo"
import { useNpoProfile } from "../../hooks/useNpoProfile"
import { OrganizationInfoCard } from "../OngProfilePage/OrganizationInfoCard"
import { ProfileHeaderCard } from "../OngProfilePage/ProfileHeaderCard"
import { ResponsibleCard } from "../OngProfilePage/ResponsibleCard"
import { PublicProjectsSection } from "./PublicProjectsSection"

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
  const [projectsLoading, setProjectsLoading] = useState(false)
  const { profile, loading, error } = useNpoProfile(numericId)

  useEffect(() => {
    if (numericId === undefined || Number.isNaN(numericId)) {
      setProjectsPage(EMPTY_PROJECTS_PAGE)
      return
    }

    let cancelled = false

    async function loadProjects() {
      try {
        setProjectsLoading(true)
        const data = await fetchNpoProfileProjects(
          numericId!,
          projectPage,
          PROJECTS_PER_PAGE,
        )
        if (!cancelled) setProjectsPage(data)
      } catch {
        if (!cancelled) setProjectsPage(EMPTY_PROJECTS_PAGE)
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
        <header className="bg-vinculo-dark px-6 py-4 shadow-md">
          <span className="text-xl font-bold text-white">
            VinculoHub<span className="text-vinculo-green">Portal</span>
          </span>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
          <p className="text-sm text-slate-500">Carregando perfil...</p>
          <PublicProjectsSection loading projects={[]} />
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-vinculo-dark">Perfil não encontrado</h1>
          <p className="mt-2 text-sm text-slate-500">
            O perfil público desta organização não está disponível.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <header className="bg-vinculo-dark px-6 py-4 shadow-md">
        <span className="text-xl font-bold text-white">
          VinculoHub<span className="text-vinculo-green">Portal</span>
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
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

        <ResponsibleCard responsible={profile.responsible} isEditing={false} />

        <PublicProjectsSection
          currentPage={projectsPage.number}
          loading={projectsLoading}
          onPageChange={setProjectPage}
          projects={projectsPage.content}
          totalElements={projectsPage.totalElements}
          totalPages={projectsPage.totalPages}
        />
      </main>
    </div>
  )
}
