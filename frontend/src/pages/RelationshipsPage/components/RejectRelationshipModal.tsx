import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import { useEffect } from "react"
import { BaseButton } from "../../../components/general/BaseButton"

type RejectRelationshipModalProps = {
  open: boolean
  isSubmitting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RejectRelationshipModal({
  open,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: RejectRelationshipModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, isSubmitting, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-relationship-title"
      aria-describedby="reject-relationship-description"
      data-testid="reject-relationship-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel()
      }}
    >
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <WarningAmberRoundedIcon
              className="text-vinculo-red"
              fontSize="large"
            />
          </div>
          <h2
            id="reject-relationship-title"
            className="text-xl font-bold text-vinculo-dark"
          >
            Recusar contato?
          </h2>
          <p
            id="reject-relationship-description"
            className="text-sm leading-6 text-slate-500"
          >
            Ao confirmar, você recusará este primeiro contato e a instituição
            parceira será informada.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            type="button"
            variant="ghost"
            className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="button"
            variant="outline"
            className="w-full border-vinculo-red! bg-vinculo-red! text-white! hover:opacity-90! sm:w-fit"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? "Recusando..." : "Confirmar recusa"}
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
