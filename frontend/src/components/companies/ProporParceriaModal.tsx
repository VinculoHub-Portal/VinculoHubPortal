import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"

export interface ProporParceriaProject {
  id: number
  title: string
}

type ProporParceriaModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (projectId: number) => void
  loading: boolean
  projects: ProporParceriaProject[]
  companyName: string
}

export function ProporParceriaModal({
  open,
  onClose,
  onConfirm,
  loading,
  projects,
  companyName,
}: ProporParceriaModalProps) {
  const [selected, setSelected] = useState<number | "">("")

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="propor-parceria-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="propor-parceria-title">Propor Parceria</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Você está propondo uma parceria com <strong>{companyName}</strong>. Selecione um
          dos seus projetos ativos para vincular.
        </Typography>
        <TextField
          select
          fullWidth
          label="Projeto"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          disabled={loading || projects.length === 0}
          helperText={
            projects.length === 0
              ? "Você não tem projetos disponíveis para propor parceria com esta empresa."
              : undefined
          }
        >
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.title}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={() => typeof selected === "number" && onConfirm(selected)}
          disabled={loading || typeof selected !== "number"}
          variant="contained"
        >
          {loading ? "Confirmando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
