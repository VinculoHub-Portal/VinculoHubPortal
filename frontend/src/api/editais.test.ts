import { afterEach, describe, expect, it, vi } from "vitest"
import { normalizeEditalRecord } from "./editais"

describe("normalizeEditalRecord", () => {
  afterEach(() => {
    vi.useRealTimers()
  })
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

  it("normaliza payload EditalResponseDTO (Spring) com ods aninhados", () => {
    const row = {
      id: 42,
      title: "Edital API",
      description: "Corpo do edital",
      fileUrl: "https://bucket/editais/x.pdf",
      fileName: "uuid_edital.pdf",
      fileSize: 2048,
      mimeType: "application/pdf",
      ods: [
        { id: 1, name: "ODS 1 — Erradicar a pobreza", description: "D1" },
        { id: 2, name: "ODS 2 — Fome zero", description: "D2" },
      ],
      expiredAt: "2026-12-31T23:59:59",
      createdAt: "2026-05-01T12:00:00",
      updatedAt: "2026-05-02T12:00:00",
    }
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"))
    const r = normalizeEditalRecord(row)
    expect(r).toMatchObject({
      id: "42",
      title: "Edital API",
      description: "Corpo do edital",
      odsLabel: "ODS 1 — Erradicar a pobreza, ODS 2 — Fome zero",
      deadline: "2026-12-31T23:59:59",
      fileUrl: "https://bucket/editais/x.pdf",
      fileName: "uuid_edital.pdf",
      publishedAt: "2026-05-01T12:00:00",
    })
    expect(r?.isActive).toBe(true)
  })

  it("EditalResponseDTO: isActive false quando expiredAt já passou", () => {
    const row = {
      id: 7,
      title: "Encerrado",
      description: null,
      fileUrl: "https://bucket/a.pdf",
      fileName: "a.pdf",
      ods: [{ id: 3, name: "ODS 3", description: "" }],
      expiredAt: "2026-03-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    }
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"))
    const r = normalizeEditalRecord(row)
    expect(r?.isActive).toBe(false)
    expect(r?.odsLabel).toBe("ODS 3")
  })

  it("EditalResponseDTO: isActive true quando expiredAt é null", () => {
    const row = {
      id: 9,
      title: "Sem prazo",
      fileUrl: "https://bucket/b.pdf",
      fileName: "b.pdf",
      ods: [],
      expiredAt: null,
      createdAt: "2026-05-10T08:00:00.000Z",
      updatedAt: "2026-05-10T08:00:00.000Z",
    }
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"))
    const r = normalizeEditalRecord(row)
    expect(r?.deadline).toBeNull()
    expect(r?.isActive).toBe(true)
  })
})
