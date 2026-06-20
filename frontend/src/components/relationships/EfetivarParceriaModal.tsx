import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import { useEffect } from "react"
import { BaseButton } from "../general/BaseButton"

type EfetivarParceriaModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  projectName: string
  partnerName: string
}

export function EfetivarParceriaModal({
  open,
  onClose,
  onConfirm,
  loading,
  projectName,
  partnerName,
}: EfetivarParceriaModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, loading, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="efetivar-parceria-title"
      data-testid="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <HandshakeOutlinedIcon className="text-vinculo-green" fontSize="large" />
          </div>
          <h2
            id="efetivar-parceria-title"
            className="text-xl font-bold text-vinculo-dark"
          >
            Efetivar Parceria
          </h2>
          <p className="text-sm leading-6 text-slate-500">
            Você está confirmando o segundo aperto de mão da parceria do projeto{" "}
            <span className="font-semibold text-slate-700">{projectName}</span> com{" "}
            <span className="font-semibold text-slate-700">{partnerName}</span>. A
            parceria só será ativada após a outra parte também confirmar.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            type="button"
            variant="ghost"
            className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            className="w-full py-2 hover:opacity-90! sm:w-fit"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Confirmando..." : "Confirmar"}
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
