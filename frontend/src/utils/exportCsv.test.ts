import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { downloadCsv } from "./exportCsv"

function setupDomMocks(clickSpy = vi.fn()) {
  vi.spyOn(document, "createElement").mockReturnValue({
    href: "",
    download: "",
    rel: "",
    click: clickSpy,
  } as unknown as HTMLAnchorElement)
  vi.spyOn(document.body, "appendChild").mockImplementation((el) => el)
  vi.spyOn(document.body, "removeChild").mockImplementation((el) => el)
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
}

describe("downloadCsv", () => {
  let capturedBlob: Blob | undefined

  beforeEach(() => {
    capturedBlob = undefined
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob
      return "blob:mock-url"
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("cria um elemento <a> e dispara o clique para download", () => {
    const clickSpy = vi.fn()
    setupDomMocks(clickSpy)

    downloadCsv("arquivo.csv", [{ nome: "ONG A" }], { nome: "Nome" })

    expect(clickSpy).toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
  })

  it("inclui linha de cabeçalho correta no CSV", async () => {
    setupDomMocks()
    downloadCsv("test.csv", [{ nome: "ONG A" }], { nome: "Nome da ONG" })
    const text = await capturedBlob!.text()
    expect(text).toContain("Nome da ONG")
    expect(text).toContain("ONG A")
  })

  it("protege contra formula injection prefixando com aspas simples", async () => {
    setupDomMocks()
    downloadCsv("test.csv", [{ formula: "=MALICIOUS()" }], { formula: "Formula" })
    const text = await capturedBlob!.text()
    expect(text).toContain("'=MALICIOUS()")
  })

  it("escapa células com vírgulas envolvendo em aspas duplas", async () => {
    setupDomMocks()
    downloadCsv("test.csv", [{ texto: "valor, com vírgula" }], { texto: "Texto" })
    const text = await capturedBlob!.text()
    expect(text).toContain('"valor, com vírgula"')
  })

  it("converte null para string vazia", async () => {
    setupDomMocks()
    downloadCsv("test.csv", [{ campo: null }], { campo: "Campo" })
    const text = await capturedBlob!.text()
    const lines = text.split("\r\n")
    expect(lines[1]).toBe("")
  })

  it("define rel=noopener noreferrer no link criado", () => {
    const anchorMock = {
      href: "",
      download: "",
      rel: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement
    vi.spyOn(document, "createElement").mockReturnValue(anchorMock)
    vi.spyOn(document.body, "appendChild").mockImplementation((el) => el)
    vi.spyOn(document.body, "removeChild").mockImplementation((el) => el)
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})

    downloadCsv("test.csv", [], { col: "Col" })

    expect(anchorMock.rel).toBe("noopener noreferrer")
  })

  it("processa múltiplas linhas corretamente", async () => {
    setupDomMocks()
    downloadCsv(
      "test.csv",
      [{ nome: "ONG A" }, { nome: "ONG B" }],
      { nome: "Nome" },
    )
    const text = await capturedBlob!.text()
    const lines = text.split("\r\n")
    expect(lines).toHaveLength(3) // header + 2 data rows (BOM is part of line 0)
    expect(lines[1]).toBe("ONG A")
    expect(lines[2]).toBe("ONG B")
  })

  it("protege contra formula injection com prefixo @", async () => {
    setupDomMocks()
    downloadCsv("test.csv", [{ cmd: "@SUM(1+1)" }], { cmd: "Cmd" })
    const text = await capturedBlob!.text()
    expect(text).toContain("'@SUM(1+1)")
  })

  it("define o atributo download com o filename correto", () => {
    const anchorMock = {
      href: "",
      download: "",
      rel: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement
    vi.spyOn(document, "createElement").mockReturnValue(anchorMock)
    vi.spyOn(document.body, "appendChild").mockImplementation((el) => el)
    vi.spyOn(document.body, "removeChild").mockImplementation((el) => el)
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})

    downloadCsv("meu-arquivo.csv", [], { col: "Col" })

    expect(anchorMock.download).toBe("meu-arquivo.csv")
  })
})
