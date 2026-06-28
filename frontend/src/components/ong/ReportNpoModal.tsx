import { useAuth0 } from "@auth0/auth0-react"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import { useEffect, useState } from "react"

import { createNpoReport } from "../../api/npoReports"
import { useToast } from "../../context/ToastContext"
import { BaseButton } from "../general/BaseButton"

type ReportNpoModalProps = {
  npoId: number
  open: boolean
  onClose: () => void
}

const MIN_REASON_LENGTH = 10
const MAX_REASON_LENGTH = 1000

export function ReportNpoModal({
  npoId,
  open,
  onClose,
}: ReportNpoModalProps) {
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()

  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function clearFields() {
    setReason("")
    setError("")
  }

  function handleClose() {
    if (isSubmitting) return

    clearFields()
    onClose()
  }

  function validateReason(value: string) {
    const trimmed = value.trim()

    if (trimmed.length < MIN_REASON_LENGTH) {
      return `Descreva o motivo com pelo menos ${MIN_REASON_LENGTH} caracteres.`
    }

    if (trimmed.length > MAX_REASON_LENGTH) {
      return `O motivo deve ter no máximo ${MAX_REASON_LENGTH} caracteres.`
    }

    return ""
  }

  async function handleSubmit() {
    const validationMessage = validateReason(reason)

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setIsSubmitting(true)

    try {
      const token = await getAccessTokenSilently()

      await createNpoReport(npoId, { reason: reason.trim() }, token)

      showToast("Denúncia enviada para análise do administrador.", "success")

      handleClose()
    } catch {
      showToast(
        "Não foi possível enviar a denúncia. Tente novamente.",
        "error",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        setReason("")
        setError("")
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, isSubmitting, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-npo-dialog-title"
      data-testid="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          handleClose()
        }
      }}
    >
      <div className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
              <WarningAmberRoundedIcon
                className="text-vinculo-red"
                fontSize="medium"
              />
            </div>

            <h2
              id="report-npo-dialog-title"
              className="text-xl font-bold text-vinculo-dark"
            >
              Denunciar ONG
            </h2>
          </div>

          <button
            type="button"
            aria-label="Fechar modal"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-900">
            <strong>Confidencial:</strong> Esta denúncia será enviada para
            análise dos administradores da plataforma. Forneça o máximo de
            informações possível para auxiliar na investigação.
          </p>
        </div>

        <div>
          <label
            htmlFor="report-npo-reason"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Descrição Detalhada *
          </label>

          <textarea
            id="report-npo-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)

              if (error) {
                setError("")
              }
            }}
            rows={6}
            maxLength={MAX_REASON_LENGTH}
            aria-label="Motivo da suspeita"
            aria-describedby="report-npo-reason-help"
            placeholder="Descreva em detalhes o motivo da sua denúncia..."
            disabled={isSubmitting}
            className={`w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${
              error
                ? "border-vinculo-red focus:border-vinculo-red focus:ring-vinculo-red/10"
                : "border-slate-300 focus:border-vinculo-dark focus:ring-vinculo-dark/10"
            }`}
          />

          {error ? (
            <p
              id="report-npo-reason-help"
              className="mt-1.5 text-sm text-vinculo-red"
            >
              {error}
            </p>
          ) : (
            <div
              id="report-npo-reason-help"
              className="mt-1.5 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                Forneça o máximo de detalhes possível para auxiliar na análise.
              </span>
              <span>
                {reason.length}/{MAX_REASON_LENGTH}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            type="button"
            variant="ghost"
            className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
            onClick={clearFields}
            disabled={isSubmitting}
          >
            Limpar Campos
          </BaseButton>

          <BaseButton
            type="button"
            variant="attention"
            className="w-full border-vinculo-red! bg-vinculo-red! py-2 text-white! hover:opacity-90! sm:w-fit"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar denúncia"}
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
