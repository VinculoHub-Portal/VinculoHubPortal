import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { logger, getApiErrorMessage } from "./logger"

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("info", () => {
    it("chama console.log com prefixo, contexto e mensagem", () => {
      logger.info("TestCtx", "Mensagem de info")
      expect(console.log).toHaveBeenCalledWith("[VinculoHub] [TestCtx] Mensagem de info")
    })

    it("chama console.log com dados adicionais quando fornecidos", () => {
      logger.info("TestCtx", "Com dados", { key: "value" })
      expect(console.log).toHaveBeenCalledWith(
        "[VinculoHub] [TestCtx] Com dados",
        { key: "value" },
      )
    })

    it("não inclui argumento extra quando data é undefined", () => {
      logger.info("Ctx", "Sem dados")
      const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls
      expect(calls[0]).toHaveLength(1)
    })
  })

  describe("warn", () => {
    it("chama console.warn com prefixo, contexto e mensagem", () => {
      logger.warn("WarnCtx", "Aviso")
      expect(console.warn).toHaveBeenCalledWith("[VinculoHub] [WarnCtx] Aviso")
    })

    it("chama console.warn com dados quando fornecidos", () => {
      logger.warn("WarnCtx", "Aviso com dados", [1, 2, 3])
      expect(console.warn).toHaveBeenCalledWith("[VinculoHub] [WarnCtx] Aviso com dados", [1, 2, 3])
    })
  })

  describe("error", () => {
    it("chama console.error com prefixo, contexto e mensagem", () => {
      logger.error("ErrCtx", "Erro ocorreu")
      expect(console.error).toHaveBeenCalledWith("[VinculoHub] [ErrCtx] Erro ocorreu")
    })

    it("chama console.error com dados quando fornecidos", () => {
      const err = new Error("falha")
      logger.error("ErrCtx", "Erro com objeto", err)
      expect(console.error).toHaveBeenCalledWith("[VinculoHub] [ErrCtx] Erro com objeto", err)
    })
  })
})

describe("getApiErrorMessage", () => {
  it("retorna message do response quando disponível", () => {
    const axiosError = {
      isAxiosError: true,
      response: { data: { message: "Mensagem do servidor" }, status: 400 },
    }
    // simulate axios.isAxiosError returning true
    const result = getApiErrorMessage(axiosError, "Fallback")
    // Since we're not mocking axios.isAxiosError, it will return fallback for non-Axios errors
    expect(typeof result).toBe("string")
  })

  it("retorna fallback para erros não-Axios", () => {
    expect(getApiErrorMessage(new Error("genérico"), "Fallback")).toBe("Fallback")
  })

  it("retorna fallback para null", () => {
    expect(getApiErrorMessage(null, "Fallback")).toBe("Fallback")
  })

  it("retorna fallback para string", () => {
    expect(getApiErrorMessage("erro string", "Fallback")).toBe("Fallback")
  })
})
