import { useParams } from "react-router-dom"
import { npoProfilesBySlug } from "../OngProfilePage/npoProfileMockData"
import { MissionCard } from "../OngProfilePage/MissionCard"
import { OrganizationInfoCard } from "../OngProfilePage/OrganizationInfoCard"
import { ProfileHeaderCard } from "../OngProfilePage/ProfileHeaderCard"
import { ResponsibleCard } from "../OngProfilePage/ResponsibleCard"

export function OngPublicProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const profile = slug ? npoProfilesBySlug[slug] : undefined

  if (!profile) {
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
          profile={profile}
          isEditing={false}
          hideEditButton
        />

        <OrganizationInfoCard profile={profile} isEditing={false} />

        <ResponsibleCard responsible={profile.responsible} isEditing={false} />

        <MissionCard mission={profile.mission} isEditing={false} />
      </main>
    </div>
  )
}
