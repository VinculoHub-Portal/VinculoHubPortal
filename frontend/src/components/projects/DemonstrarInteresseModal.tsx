import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material"

type DemonstrarInteresseModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export function DemonstrarInteresseModal({
  open,
  onClose,
  onConfirm,
  loading,
}: DemonstrarInteresseModalProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="demonstrar-interesse-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="demonstrar-interesse-title">Demonstrar Interesse</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Você está iniciando o primeiro contato com a organização responsável pelo projeto.
          Eles receberão uma notificação por e-mail e poderão decidir se aceitam ou não a
          parceria.
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
