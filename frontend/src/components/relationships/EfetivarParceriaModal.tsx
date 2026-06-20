import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material"

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
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="efetivar-parceria-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="efetivar-parceria-title">Efetivar Parceria</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Você está confirmando o segundo aperto de mão da parceria do projeto{" "}
          <strong>{projectName}</strong> com <strong>{partnerName}</strong>. A parceria só
          será ativada após a outra parte também confirmar.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained">
          {loading ? "Confirmando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
