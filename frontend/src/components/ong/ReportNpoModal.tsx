import { useAuth0 } from "@auth0/auth0-react"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Typography,
  IconButton,
} from "@mui/material"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { useState } from "react"

import { createNpoReport } from "../../api/npoReports"
import { useToast } from "../../context/ToastContext"

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

      await createNpoReport(
        npoId,
        { reason: reason.trim() },
        token
      )

      showToast(
        "Denúncia enviada para análise do administrador.",
        "success"
      )

      handleClose()
    } catch {
      showToast(
        "Não foi possível enviar a denúncia. Tente novamente.",
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "10px",
          p: 1,
        },
      }}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "999px",
                backgroundColor: "#FFE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningAmberRoundedIcon
                sx={{
                  color: "#E7000B",
                  fontSize: 20,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 500,
                color: "#00467F",
              }}
            >
              Denunciar ONG
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            disabled={isSubmitting}
            size="small"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: "10px",
            backgroundColor: "#EFF6FF",
            border: "1px solid #BEDBFF",
          }}
        >
          <Typography
            sx={{
              color: "#1C398E",
              fontSize: 14,
              lineHeight: "20px",
            }}
          >
            <strong>Confidencial:</strong> Esta denúncia será enviada para
            análise dos administradores da plataforma. Forneça o máximo de
            informações possível para auxiliar na investigação.
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              mb: 1,
              fontSize: 14,
              fontWeight: 500,
              color: "#364153",
            }}
          >
            Descrição Detalhada *
          </Typography>

          <TextField
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)

              if (error) {
                setError("")
              }
            }}
            multiline
            minRows={6}
            fullWidth
            placeholder="Descreva em detalhes o motivo da sua denúncia..."
            error={Boolean(error)}
            helperText={
              error ||
              `${reason.length}/${MAX_REASON_LENGTH}`
            }
            inputProps={{
              maxLength: MAX_REASON_LENGTH,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />

          {!error && (
            <Typography
              sx={{
                mt: 1,
                fontSize: 12,
                color: "#6A7282",
              }}
            >
              Forneça o máximo de detalhes possível para auxiliar na análise.
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={clearFields}
            disabled={isSubmitting}
            sx={{
              height: 52,
              borderRadius: "10px",
              textTransform: "none",
              borderWidth: 2,
            }}
          >
            Limpar Campos
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            sx={{
              height: 52,
              borderRadius: "10px",
              textTransform: "none",
              backgroundColor: "#E7000B",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",

              "&:hover": {
                backgroundColor: "#C70009",
              },
            }}
          >
            {isSubmitting ? "Enviando..." : "Enviar denúncia"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}