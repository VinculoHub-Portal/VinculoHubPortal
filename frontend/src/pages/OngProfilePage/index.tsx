import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BackLink } from "../../components/general/BackLink"
import { Header } from "../../components/general/Header"
import { mockNpoProfile, type NpoProfile } from "./npoProfileMockData"
import { MissionCard } from "./MissionCard"
import { OrganizationInfoCard } from "./OrganizationInfoCard"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { PublicProfileCard } from "./PublicProfileCard"
import { ResponsibleCard } from "./ResponsibleCard"

export function OngProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<NpoProfile>(mockNpoProfile)
  const [draft, setDraft] = useState<NpoProfile>(mockNpoProfile)
  const [isEditing, setIsEditing] = useState(false)

  function handleEdit() {
    setDraft(profile)
    setIsEditing(true)
  }

  function handleCancel() {
    setDraft(profile)
    setIsEditing(false)
  }

  function handleSave() {
    setProfile(draft)
    setIsEditing(false)
  }

  function handleChange<K extends keyof NpoProfile>(field: K, value: NpoProfile[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function handleResponsibleChange<K extends keyof NpoProfile["responsible"]>(
    field: K,
    value: NpoProfile["responsible"][K]
  ) {
    setDraft((prev) => ({
      ...prev,
      responsible: { ...prev.responsible, [field]: value },
    }))
  }

  const current = isEditing ? draft : profile

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
        <BackLink
          label="Voltar ao Dashboard"
          onClick={() => navigate("/ong/dashboard")}
        />

        <ProfileHeaderCard
          profile={current}
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleChange}
        />

        <OrganizationInfoCard
          profile={current}
          isEditing={isEditing}
          onChange={handleChange}
        />

        <ResponsibleCard
          responsible={current.responsible}
          isEditing={isEditing}
          onChange={handleResponsibleChange}
        />

        <MissionCard
          mission={current.mission}
          isEditing={isEditing}
          onChange={(value) => handleChange("mission", value)}
        />

        <PublicProfileCard slug={profile.slug} />
      </main>
    </div>
  )
}
