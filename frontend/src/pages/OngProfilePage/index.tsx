import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BackLink } from "../../components/general/BackLink"
import { Header } from "../../components/general/Header"
import { useNpoProfile } from "../../hooks/useNpoProfile"
import type { NpoAddressData, NpoContactData, NpoInstitutionalData, NpoProfileUpdateRequest, NpoResponsibleData } from "../../api/npo"
import { OrganizationInfoCard } from "./OrganizationInfoCard"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { PrivateDocumentsCard } from "./PrivateDocumentsCard"
import { PublicProfileCard } from "./PublicProfileCard"
import { ResponsibleCard } from "./ResponsibleCard"

interface DraftState {
  institutionalData: NpoInstitutionalData
  contact: NpoContactData
  address: NpoAddressData | null
  responsible: NpoResponsibleData | null
}

export function OngProfilePage() {
  const navigate = useNavigate()
  const { profile, loading, error, save } = useNpoProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 py-10">
          <p className="text-sm text-slate-500">Carregando perfil…</p>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 py-10">
          <p className="text-sm text-red-600">{error ?? "Perfil não encontrado."}</p>
        </main>
      </div>
    )
  }

  const editable = profile.viewerContext === "OWNER"
  const current = isEditing && draft ? draft : profile

  function handleEdit() {
    setDraft({
      institutionalData: profile!.institutionalData,
      contact: profile!.contact,
      address: profile!.address,
      responsible: profile!.responsible,
    })
    setSaveError(null)
    setIsEditing(true)
  }

  function handleCancel() {
    setDraft(null)
    setIsEditing(false)
    setSaveError(null)
  }

  async function handleSave() {
    if (!draft) return
    try {
      const payload: NpoProfileUpdateRequest = {
        institutionalData: {
          name: draft.institutionalData.name,
          description: draft.institutionalData.description ?? undefined,
          cnpj: draft.institutionalData.cnpj ?? undefined,
          cpf: draft.institutionalData.cpf ?? undefined,
        },
        contact: {
          email: draft.contact.email ?? undefined,
          phone: draft.contact.phone ?? undefined,
        },
        address: draft.address
          ? {
              street: draft.address.street ?? undefined,
              number: draft.address.number ?? undefined,
              complement: draft.address.complement ?? undefined,
              city: draft.address.city ?? undefined,
              stateCode: draft.address.stateCode ?? undefined,
              state: draft.address.state ?? undefined,
              zipCode: draft.address.zipCode ?? undefined,
            }
          : undefined,
        responsible: draft.responsible
          ? {
              name: draft.responsible.name ?? undefined,
              email: draft.responsible.email ?? undefined,
            }
          : undefined,
      }
      await save(payload)
      setIsEditing(false)
      setDraft(null)
      setSaveError(null)
    } catch {
      setSaveError("Erro ao salvar. Tente novamente.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6">
        <BackLink
          label="Voltar ao Dashboard"
          onClick={() => navigate("/ong/dashboard")}
        />

        <ProfileHeaderCard
          institutionalData={current.institutionalData}
          editable={editable}
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={() => void handleSave()}
          onCancel={handleCancel}
          onChange={(field, value) =>
            setDraft((prev) =>
              prev ? { ...prev, institutionalData: { ...prev.institutionalData, [field]: value } } : prev,
            )
          }
        />

        <OrganizationInfoCard
          institutionalData={current.institutionalData}
          contact={current.contact}
          address={current.address}
          isEditing={isEditing}
          onInstitutionalChange={(field, value) =>
            setDraft((prev) =>
              prev ? { ...prev, institutionalData: { ...prev.institutionalData, [field]: value } } : prev,
            )
          }
          onContactChange={(field, value) =>
            setDraft((prev) =>
              prev ? { ...prev, contact: { ...prev.contact, [field]: value } } : prev,
            )
          }
          onAddressChange={(field, value) =>
            setDraft((prev) =>
              prev
                ? {
                    ...prev,
                    address: prev.address
                      ? { ...prev.address, [field]: value }
                      : { id: null, state: null, stateCode: null, city: null, street: null, number: null, complement: null, zipCode: null, [field]: value },
                  }
                : prev,
            )
          }
        />

        <ResponsibleCard
          responsible={current.responsible}
          isEditing={isEditing}
          onNameChange={(value) =>
            setDraft((prev) =>
              prev
                ? {
                    ...prev,
                    responsible: prev.responsible
                      ? { ...prev.responsible, name: value }
                      : { id: null, name: value, email: null, auth0Id: null, userType: null },
                  }
                : prev,
            )
          }
        />

        {saveError && (
          <p className="text-sm text-red-600">{saveError}</p>
        )}

        {editable && (
          <>
            <PrivateDocumentsCard />
            <PublicProfileCard id={profile.institutionalData.id} />
          </>
        )}
      </main>
    </div>
  )
}
