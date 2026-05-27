import { describe, expect, it } from "vitest";
import { mapApiPayloadToProjectDetails } from "./projectDetailsMapping";

const ROUTE_ID = "proj-1";

describe("mapApiPayloadToProjectDetails", () => {
  describe("fundingType — Lei de Incentivo x Investimento Social Privado", () => {
    it("mapeia TAX_INCENTIVE_LAW para Lei de Incentivo", () => {
      const result = mapApiPayloadToProjectDetails({ type: "TAX_INCENTIVE_LAW" }, ROUTE_ID);
      expect(result.fundingType).toBe("Lei de Incentivo");
    });

    it("mapeia GOVERNMENTAL para Lei de Incentivo", () => {
      const result = mapApiPayloadToProjectDetails({ type: "GOVERNMENTAL" }, ROUTE_ID);
      expect(result.fundingType).toBe("Lei de Incentivo");
    });

    it("mapeia SOCIAL_INVESTMENT_LAW para Investimento Social Privado", () => {
      const result = mapApiPayloadToProjectDetails({ type: "SOCIAL_INVESTMENT_LAW" }, ROUTE_ID);
      expect(result.fundingType).toBe("Investimento Social Privado");
    });

    it("mapeia SOCIAL para Investimento Social Privado", () => {
      const result = mapApiPayloadToProjectDetails({ type: "SOCIAL" }, ROUTE_ID);
      expect(result.fundingType).toBe("Investimento Social Privado");
    });

    it("inclui requiredAmount quando budgetNeeded presente", () => {
      const result = mapApiPayloadToProjectDetails(
        { type: "TAX_INCENTIVE_LAW", budgetNeeded: 75000 },
        ROUTE_ID,
      );
      expect(result.requiredAmount).toBe(75000);
    });

    it("aceita budget_needed em snake_case", () => {
      const result = mapApiPayloadToProjectDetails(
        { type: "TAX_INCENTIVE_LAW", budget_needed: 50000 },
        ROUTE_ID,
      );
      expect(result.requiredAmount).toBe(50000);
    });
  });

  describe("progressPercent", () => {
    it("usa progressPercent direto quando presente", () => {
      const result = mapApiPayloadToProjectDetails({ progressPercent: 42 }, ROUTE_ID);
      expect(result.progressPercent).toBe(42);
    });

    it("calcula progress a partir de investedAmount / budgetNeeded", () => {
      const result = mapApiPayloadToProjectDetails(
        { budgetNeeded: 100000, investedAmount: 40000 },
        ROUTE_ID,
      );
      expect(result.progressPercent).toBe(40);
    });

    it("clampa progress em 100", () => {
      const result = mapApiPayloadToProjectDetails(
        { budgetNeeded: 100, investedAmount: 200 },
        ROUTE_ID,
      );
      expect(result.progressPercent).toBe(100);
    });

    it("retorna 0 quando sem dados de progresso", () => {
      const result = mapApiPayloadToProjectDetails({}, ROUTE_ID);
      expect(result.progressPercent).toBe(0);
    });
  });

  describe("sdgLabels", () => {
    it("usa sdgLabels direto quando presente", () => {
      const result = mapApiPayloadToProjectDetails(
        { sdgLabels: ["Educação de Qualidade"] },
        ROUTE_ID,
      );
      expect(result.sdgLabels).toEqual(["Educação de Qualidade"]);
    });

    it("extrai nomes de ods[] quando sdgLabels ausente", () => {
      const result = mapApiPayloadToProjectDetails(
        { ods: [{ name: "Saúde e Bem-Estar" }] },
        ROUTE_ID,
      );
      expect(result.sdgLabels).toEqual(["Saúde e Bem-Estar"]);
    });

    it("mapeia odsCodes para nomes ODS quando ods ausente", () => {
      const result = mapApiPayloadToProjectDetails({ odsCodes: [4] }, ROUTE_ID);
      expect(result.sdgLabels).toEqual(["Educação de Qualidade"]);
    });
  });

  describe("responsibleInstitution", () => {
    it("retorna null quando campo ausente", () => {
      const result = mapApiPayloadToProjectDetails({}, ROUTE_ID);
      expect(result.responsibleInstitution).toBeNull();
    });

    it("retorna null quando campo é null explícito", () => {
      const result = mapApiPayloadToProjectDetails(
        { responsibleInstitution: null },
        ROUTE_ID,
      );
      expect(result.responsibleInstitution).toBeNull();
    });

    it("retorna null quando name está vazio", () => {
      const result = mapApiPayloadToProjectDetails(
        { responsibleInstitution: { name: "", city: "Porto Alegre" } },
        ROUTE_ID,
      );
      expect(result.responsibleInstitution).toBeNull();
    });

    it("mapeia todos os campos quando presentes", () => {
      const result = mapApiPayloadToProjectDetails(
        {
          responsibleInstitution: {
            name: "Saúde Solidária",
            logoUrl: "https://example.com/logo.png",
            city: "Recife",
            stateCode: "PE",
            description: "ONG focada em saúde.",
          },
        },
        ROUTE_ID,
      );
      expect(result.responsibleInstitution).toEqual({
        name: "Saúde Solidária",
        logoUrl: "https://example.com/logo.png",
        city: "Recife",
        stateCode: "PE",
        description: "ONG focada em saúde.",
      });
    });

    it("mapeia campos ausentes como null", () => {
      const result = mapApiPayloadToProjectDetails(
        { responsibleInstitution: { name: "ONG Teste" } },
        ROUTE_ID,
      );
      expect(result.responsibleInstitution).toEqual({
        name: "ONG Teste",
        logoUrl: null,
        city: null,
        stateCode: null,
        description: null,
      });
    });

    it("aceita responsible_institution em snake_case", () => {
      const result = mapApiPayloadToProjectDetails(
        { responsible_institution: { name: "ONG Snake" } },
        ROUTE_ID,
      );
      expect(result.responsibleInstitution?.name).toBe("ONG Snake");
    });

    it("aceita logo_url e state_code em snake_case", () => {
      const result = mapApiPayloadToProjectDetails(
        {
          responsibleInstitution: {
            name: "ONG Teste",
            logo_url: "https://example.com/logo.png",
            state_code: "RS",
          },
        },
        ROUTE_ID,
      );
      expect(result.responsibleInstitution?.logoUrl).toBe("https://example.com/logo.png");
      expect(result.responsibleInstitution?.stateCode).toBe("RS");
    });
  });
});
