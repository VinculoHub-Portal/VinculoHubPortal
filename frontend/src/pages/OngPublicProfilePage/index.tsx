import { useParams } from "react-router-dom"
import { useNpoProfile } from "../../hooks/useNpoProfile"
import { OrganizationInfoCard } from "../OngProfilePage/OrganizationInfoCard"
import { ProfileHeaderCard } from "../OngProfilePage/ProfileHeaderCard"
import { ResponsibleCard } from "../OngProfilePage/ResponsibleCard"
import { PublicProjectsSection } from "./PublicProjectsSection"

export function OngPublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const numericId = id ? Number(id) : undefined
  const { profile, loading, error } = useNpoProfile(numericId)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Carregando perfil…</p>
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

        <PublicProjectsSection projects={profile.projects ?? []} />
      </main>
    </div>
  )
}
