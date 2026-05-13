import { describe, expect, it } from "vitest"
import { normalizeEditalRecord } from "./editais"

describe("normalizeEditalRecord", () => {
  it("normaliza payload em português", () => {
    const row = {
      id: 1,
      titulo: "Edital X",
      descricao: "Descrição",
      status: "ACTIVE",
      odsTitulo: "ODS 1",
      prazo: "2026-05-14",
      arquivoUrl: "https://bucket/s3/x.pdf",
      nomeArquivo: "x.pdf",
      dataPublicacao: "2026-02-28",
    }
    const r = normalizeEditalRecord(row)
    expect(r).toMatchObject({
      id: "1",
      title: "Edital X",
      description: "Descrição",
      isActive: true,
      odsLabel: "ODS 1",
      deadline: "2026-05-14",
      fileUrl: "https://bucket/s3/x.pdf",
      fileName: "x.pdf",
      publishedAt: "2026-02-28",
    })
  })

  it("aceita lista em inglês", () => {
    const row = {
      id: "a2",
      title: "Notice",
      description: "D",
      status: "INACTIVE",
      odsLabel: "ODS 2",
      deadline: "2026-01-01",
      fileUrl: "https://f",
      fileName: "n.pdf",
      publishedAt: "2025-12-01",
    }
    const r = normalizeEditalRecord(row)
    expect(r?.isActive).toBe(false)
    expect(r?.title).toBe("Notice")
  })

  it("retorna null sem id ou título", () => {
    expect(normalizeEditalRecord({ titulo: "Sem id" })).toBeNull()
    expect(normalizeEditalRecord({ id: 1 })).toBeNull()
    expect(normalizeEditalRecord(null)).toBeNull()
  })
})
