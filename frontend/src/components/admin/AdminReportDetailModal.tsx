import { useAuth0 } from "@auth0/auth0-react"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material"
import { useState } from "react"
import {
  updateAdminNpoReportStatus,
  type NpoReportResponse,
  type NpoReportStatus,
} from "../../api/npoReports"
import { useToast } from "../../context/ToastContext"

const STATUS_LABELS: Record<NpoReportStatus, string> = {
  OPEN: "Aberta",
  RESOLVED: "Resolvida",
  DISMISSED: "Descartada",
}

const STATUS_OPTIONS: NpoReportStatus[] = ["OPEN", "RESOLVED", "DISMISSED"]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date)
}

type Props = {
  report: NpoReportResponse
  open: boolean
  onClose: () => void
  onStatusChanged: (updated: NpoReportResponse) => void
}

export function AdminReportDetailModal({ report, open, onClose, onStatusChanged }: Props) {
  const { getAccessTokenSilently } = useAuth0()
  const { showToast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState<NpoReportStatus>(report.status)
  const [saving, setSaving] = useState(false)

  const hasChanged = selectedStatus !== report.status

  async function handleSave() {
    if (!hasChanged) return
    setSaving(true)
    try {
      const token = await getAccessTokenSilently()
      const updated = await updateAdminNpoReportStatus(report.id, { status: selectedStatus }, token)
      showToast(`Status atualizado para "${STATUS_LABELS[selectedStatus]}".`, "success")
      onStatusChanged(updated)
      onClose()
    } catch {
      showToast("Não foi possível atualizar o status. Tente novamente.", "error")
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (saving) return
    setSelectedStatus(report.status)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="report-detail-dialog-title"
      PaperProps={{ sx: { borderRadius: "10px", p: 1 } }}
    >
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
              <ReportProblemOutlinedIcon sx={{ color: "#E7000B", fontSize: 20 }} />
            </Box>
            <Typography
              id="report-detail-dialog-title"
              sx={{ fontSize: 18, fontWeight: 600, color: "#00467F" }}
            >
              Detalhes da Denúncia #{report.id}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={saving} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DetailRow label="ONG denunciada" value={report.npo.name} />
          {report.npo.email && <DetailRow label="E-mail da ONG" value={report.npo.email} />}
          <DetailRow label="Empresa denunciante" value={report.reporterCompany.name} />
          <DetailRow label="Usuário responsável" value={`${report.reporterUser.name} (${report.reporterUser.email})`} />
          <DetailRow label="Data de abertura" value={formatDate(report.createdAt)} />
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: "10px",
            backgroundColor: "#FFF7ED",
            border: "1px solid #FED7AA",
          }}
        >
          <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 600, color: "#9A3412", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Motivo
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#431407", lineHeight: "1.6" }}>
            {report.reason}
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 500, color: "#364153" }}>
            Status da denúncia
          </Typography>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as NpoReportStatus)}
            disabled={saving}
            fullWidth
            size="small"
            sx={{ borderRadius: "8px" }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex-1 rounded-[10px] border-2 border-slate-300 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!hasChanged || saving}
            className="flex-1 rounded-[10px] bg-vinculo-dark py-3 text-sm font-medium text-white transition hover:bg-vinculo-dark/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Salvando..." : "Salvar alteração"}
          </button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
