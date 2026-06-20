import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAdminNpos, fetchAdminRelationships, fetchAdminVinculos } from "./admin";

const mocks = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}));

vi.mock("../services/api", () => ({
  api: {
    get: mocks.apiGetMock,
  },
}));

vi.mock("../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("admin api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.apiGetMock.mockResolvedValue({ data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 } });
  });

  it("serializa os filtros das ONGs do painel administrativo", async () => {
    await fetchAdminNpos("token", {
      search: "verde",
      area: "environmental",
      status: "active",
      page: 2,
      size: 12,
    });

    expect(mocks.apiGetMock).toHaveBeenCalledWith(
      "/api/admin/ongs",
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(mocks.apiGetMock.mock.calls[0][1].params.toString()).toBe(
      "search=verde&area=environmental&active=true&page=2&size=12",
    );
  });

  it("serializa os filtros dos vínculos do painel administrativo", async () => {
    await fetchAdminRelationships("token", {
      companyName: "Empresa",
      npoName: "ONG",
      projectTitle: "Projeto",
      status: "active",
      page: 1,
      size: 10,
    });

    expect(mocks.apiGetMock).toHaveBeenCalledWith(
      "/api/admin/vinculos/search",
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(mocks.apiGetMock.mock.calls[0][1].params.toString()).toBe(
      "companyName=Empresa&npoName=ONG&projectTitle=Projeto&status=active&page=1&size=10",
    );
  });

  it("usa a rota legada para a listagem simples de vínculos", async () => {
    await fetchAdminVinculos("token", 3, 20);

    expect(mocks.apiGetMock).toHaveBeenCalledWith(
      "/api/admin/vinculos",
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
        params: { page: 3, size: 20, sort: "createdAt,desc" },
      }),
    );
  });
});
