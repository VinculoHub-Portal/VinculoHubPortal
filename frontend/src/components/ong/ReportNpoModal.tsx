import { useAuth0 } from "@auth0/auth0-react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material"
import { useState } from "react"
import { createNpoReport } from "../../api/npoReports"
import { useToast } from "../../context/ToastContext"

type ReportNpoModalProps = {
  npoId: number
  open: boolean
  onClose: () => void
}

// TODO botão Denunciar:
// Plugar este modal no perfil da ONG quando o botão da empresa for implementado.
// Exemplo:
// const [isReportModalOpen, setIsReportModalOpen] = useState(false)
// <button type="button" onClick={() => setIsReportModalOpen(true)}>Denunciar</button>
// <ReportNpoModal npoId={npoId} open={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
// O botão deve aparecer somente para usuários empresa e a ONG não deve receber notificação.

const MIN_REASON_LENGTH = 10
const MAX_REASON_LENGTH = 1000

export function ReportNpoModal({ npoId, open, onClose }: ReportNpoModalProps) {
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setReason("")
    setError("")
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
      resetAndClose()
    } catch {
      showToast("Não foi possível enviar a denúncia. Tente novamente.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : resetAndClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="report-npo-title"
    >
      <DialogTitle id="report-npo-title">Denunciar ONG</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            label="Motivo da suspeita"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError("")
            }}
            multiline
            minRows={5}
            fullWidth
            required
            error={Boolean(error)}
            helperText={error || `${reason.length}/${MAX_REASON_LENGTH}`}
            inputProps={{ maxLength: MAX_REASON_LENGTH }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar denúncia"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
