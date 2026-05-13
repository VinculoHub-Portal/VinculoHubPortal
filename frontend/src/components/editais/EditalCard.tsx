import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

const editalIconActionClassName =
  "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"

export type EditalCardProps = {
  title: string
  /** Quando true, exibe o selo verde "Ativo"; caso contrário, selo neutro "Encerrado". */
  isActive: boolean
  description?: string | null
  odsLabel?: string | null
  /** Já formatado, ex.: "Prazo: 14/05/2026" */
  deadlineLine?: string | null
  fileUrl?: string | null
  fileName?: string | null
  publishedLine?: string | null
}

export function EditalCard({
  title,
  isActive,
  description,
  odsLabel,
  deadlineLine,
  fileUrl,
  fileName,
  publishedLine,
}: EditalCardProps) {
  const displayName = fileName?.trim() || "Documento do edital"
  const canOpenFile = Boolean(fileUrl)

  function openFile() {
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer")
  }

  function downloadFile() {
    if (!fileUrl) return
    const a = document.createElement("a")
    a.href = fileUrl
    a.download = fileName?.trim() || "edital.pdf"
    a.rel = "noopener noreferrer"
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label={`Edital ${title}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-vinculo-dark">{title}</h3>
          <span
            className={
              isActive
                ? "shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                : "shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
            }
          >
            {isActive ? "Ativo" : "Encerrado"}
          </span>
        </div>
        <div className="mr-1 flex shrink-0 gap-2">
          <button
            type="button"
            onClick={openFile}
            disabled={!canOpenFile}
            title={canOpenFile ? "Abrir documento do edital" : "Documento indisponível"}
            aria-label={`Visualizar documento do edital ${title}`}
            className={editalIconActionClassName}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </button>
          <button
            type="button"
            onClick={downloadFile}
            disabled={!canOpenFile}
            title={canOpenFile ? "Baixar documento do edital" : "Documento indisponível"}
            aria-label={`Baixar documento do edital ${title}`}
            className={editalIconActionClassName}
          >
            <FileDownloadOutlinedIcon fontSize="small" />
          </button>
        </div>
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}

      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
        <div className="flex min-w-0 items-start gap-2">
          <LabelOutlinedIcon className="mt-0.5 shrink-0 text-vinculo-dark" fontSize="small" />
          <span className="min-w-0 break-words">{odsLabel ?? "—"}</span>
        </div>
        <div className="flex min-w-0 items-start gap-2">
          <CalendarTodayOutlinedIcon
            className="mt-0.5 shrink-0 text-vinculo-dark"
            fontSize="small"
          />
          <span className="min-w-0 break-words">{deadlineLine ?? "—"}</span>
        </div>
        <div className="flex min-w-0 items-start gap-2">
          <DescriptionOutlinedIcon
            className="mt-0.5 shrink-0 text-vinculo-dark"
            fontSize="small"
          />
          {canOpenFile ? (
            <a
              href={fileUrl!}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="min-w-0 break-all font-medium text-vinculo-dark underline decoration-vinculo-dark/30 underline-offset-2 hover:opacity-80"
            >
              {displayName}
            </a>
          ) : (
            <span className="min-w-0 break-words text-slate-500">{fileName ?? "—"}</span>
          )}
        </div>
      </div>

      {publishedLine ? (
        <>
          <hr className="my-4 border-slate-200" />
          <p className="text-xs text-slate-500">{publishedLine}</p>
        </>
      ) : null}
    </article>
  )
}
