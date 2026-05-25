import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import { useEffect } from "react"
import { BaseButton } from "../general/BaseButton"

type ConfirmDeleteProjectModalProps = {
  open: boolean
  projectTitle: string
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteProjectModal({
  open,
  projectTitle,
  isDeleting = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteProjectModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, isDeleting, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      data-testid="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel()
      }}
    >
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <WarningAmberRoundedIcon className="text-vinculo-red" fontSize="large" />
          </div>
          <h2
            id="confirm-delete-title"
            className="text-xl font-bold text-vinculo-dark"
          >
            Excluir projeto?
          </h2>
          <p className="text-sm leading-6 text-slate-500">
            Tem certeza que deseja excluir o projeto{" "}
            <span className="font-semibold text-slate-700">"{projectTitle}"</span>?
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            type="button"
            variant="ghost"
            className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="button"
            variant="outline"
            className="w-full border-vinculo-red! bg-vinculo-red! py-2 text-white! hover:opacity-90! sm:w-fit"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
