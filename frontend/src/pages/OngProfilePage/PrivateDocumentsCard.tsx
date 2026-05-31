import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import {
  fetchMyOngDocuments,
  getMyOngDocumentDownloadUrl,
  type DocumentResponseDTO,
} from "../../api/document"

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "Tamanho indisponível"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  })} ${units[unitIndex]}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Data indisponível"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"

  return new Intl.DateTimeFormat("pt-BR").format(date)
}

export function PrivateDocumentsCard() {
  const { getAccessTokenSilently } = useAuth0()
  const [documents, setDocuments] = useState<DocumentResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDocuments() {
      try {
        setLoading(true)
        setError(null)
        const token = await getAccessTokenSilently()
        const response = await fetchMyOngDocuments(token)
        if (!cancelled) setDocuments(response.content)
      } catch {
        if (!cancelled) setError("Não foi possível carregar os documentos.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDocuments()

    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently])

  async function handleDownload(documentId: number) {
    try {
      setDownloadingId(documentId)
      const token = await getAccessTokenSilently()
      const response = await getMyOngDocumentDownloadUrl(documentId, token)
      window.open(response.downloadUrl, "_blank", "noopener,noreferrer")
    } catch {
      setError("Não foi possível gerar o link de download.")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <LockOutlinedIcon fontSize="small" className="text-vinculo-dark" />
          <h2 className="text-base font-semibold text-vinculo-dark">Documentos privados</h2>
        </div>
        {!loading && !error && (
          <span className="text-sm text-slate-500">
            {documents.length} documento{documents.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Estes arquivos são restritos à conta da ONG. Empresas, visitantes externos e administradores não têm acesso a esta listagem.
      </p>

      {loading && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Carregando documentos...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nenhum documento enviado até o momento.
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-vinculo-dark text-white">
                  <DescriptionOutlinedIcon fontSize="small" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-vinculo-dark">
                    {document.title || document.fileName}
                  </p>
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {document.fileName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(document.fileSize)} · Enviado em {formatDate(document.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-vinculo-dark transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                disabled={downloadingId === document.id}
                onClick={() => void handleDownload(document.id)}
              >
                <DownloadOutlinedIcon fontSize="small" />
                {downloadingId === document.id ? "Gerando..." : "Baixar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
