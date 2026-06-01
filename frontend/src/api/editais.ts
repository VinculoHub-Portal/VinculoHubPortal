import { api } from "../services/api"
import { logger } from "../utils/logger"

export type EditalApiRecord = Record<string, unknown>

export type EditalListItem = {
  id: string
  title: string
  description: string | null
  isActive: boolean
  odsLabel: string | null
  deadline: string | null
  fileUrl: string | null
  fileName: string | null
  publishedAt: string | null
}

function pickString(obj: EditalApiRecord, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return null
}

function pickBool(obj: EditalApiRecord, keys: string[]): boolean | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === "boolean") return v
    if (v === "ACTIVE" || v === "ATIVO" || v === "true") return true
    if (v === "INACTIVE" || v === "INATIVO" || v === "false") return false
  }
  return null
}

function odsLabelFromRecord(obj: EditalApiRecord): string | null {
  const nested = obj.ods
  if (Array.isArray(nested) && nested.length > 0) {
    const names = nested
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const o = item as Record<string, unknown>
        const name = typeof o.name === "string" ? o.name.trim() : null
        return name || null
      })
      .filter((n): n is string => Boolean(n))
    if (names.length) return names.join(", ")
  }
  return pickString(obj, [
    "ods",
    "odsTitulo",
    "odsLabel",
    "odsDescricao",
    "objetivoDesenvolvimentoSustentavel",
  ])
}

function deriveIsActive(obj: EditalApiRecord, deadlineIso: string | null): boolean {
  const isActiveFromBool = pickBool(obj, ["ativo", "active", "publicado"])
  if (isActiveFromBool !== null) return isActiveFromBool
  const statusStr = pickString(obj, ["status", "situacao"])
  if (statusStr) return ["ACTIVE", "ATIVO", "PUBLICADO"].includes(statusStr.toUpperCase())
  if (!deadlineIso) return true
  const end = new Date(deadlineIso)
  if (Number.isNaN(end.getTime())) return true
  return end.getTime() > Date.now()
}

export function normalizeEditalRecord(raw: unknown): EditalListItem | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as EditalApiRecord
  const idRaw = obj.id ?? obj.editalId
  if (idRaw === undefined || idRaw === null) return null
  const id = String(idRaw)
  const title =
    pickString(obj, ["titulo", "title", "nome", "tituloEdital"]) ?? ""
  if (!title) return null

  const deadline = pickString(obj, [
    "expiredAt",
    "prazo",
    "deadline",
    "dataPrazo",
    "dataLimite",
    "endDate",
  ])
  const isActive = deriveIsActive(obj, deadline)

  return {
    id,
    title,
    description: pickString(obj, ["descricao", "description", "resumo"]),
    isActive,
    odsLabel: odsLabelFromRecord(obj),
    deadline,
    fileUrl: pickString(obj, [
      "arquivoUrl",
      "fileUrl",
      "urlArquivo",
      "documentoUrl",
      "linkArquivo",
      "s3Url",
    ]),
    fileName: pickString(obj, ["nomeArquivo", "fileName", "arquivoNome", "documentoNome"]),
    publishedAt: pickString(obj, [
      "dataPublicacao",
      "publishedAt",
      "createdAt",
      "dataCriacao",
    ]),
  }
}

export interface EditalPage {
  content: EditalListItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export async function fetchEditais(
  token?: string,
  activeOnly = false,
  page = 0,
  size = 10,
): Promise<EditalPage> {
  logger.info("EditaisAPI", "Fetching editais", { page, size, activeOnly })
  try {
    const { data } = await api.get<unknown>("/api/editais", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      params: { ...(activeOnly && { active: true }), page, size },
    })

    if (data && typeof data === "object" && "content" in data) {
      const paged = data as {
        content: unknown[]
        totalElements: number
        totalPages: number
        number: number
        size: number
      }
      const content = paged.content
        .map(normalizeEditalRecord)
        .filter((e): e is EditalListItem => e !== null)
      logger.info("EditaisAPI", "Editais fetched", { total: paged.totalElements, page: paged.number })
      return {
        content,
        totalElements: paged.totalElements,
        totalPages: paged.totalPages,
        number: paged.number,
        size: paged.size,
      }
    }

    const list = Array.isArray(data) ? data : []
    const content = list.map(normalizeEditalRecord).filter((e): e is EditalListItem => e !== null)
    logger.info("EditaisAPI", "Editais fetched (non-paged)", { count: content.length })
    return { content, totalElements: content.length, totalPages: 1, number: 0, size: content.length }
  } catch (error) {
    logger.error("EditaisAPI", "Failed to fetch editais", error)
    throw error
  }
}
