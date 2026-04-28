import { describe, it, expect } from "vitest";
import {
  validateSignupStep,
  validateNpoStepTwo,
  validateNpoStepThree,
  validateNpoStepFour,
  validateCpfOrCnpjField,
  validateProjectType,
} from "./validation";
import type { WizardFormData } from "../types/wizard.types";

const baseFormData: WizardFormData = {
  nomeInstituicao: "",
  cnpj: "",
  razaoSocial: "",
  cpf: "",
  porteOng: "",
  resumoInstitucional: "",
  esg: [],
  zipCode: "",
  street: "",
  streetNumber: "",
  complement: "",
  city: "",
  state: "",
  stateCode: "",
  phone: "",
  nomeProjeto: "",
  tipoProjeto: "",
  descricaoProjeto: "",
  metaCaptacao: "",
  odsProjeto: [],
};

const ctx = { organizationType: "npo" as const };

describe("validateSignupStep", () => {
  it("retorna erro quando nenhum tipo de cadastro está selecionado", () => {
    const errors = validateSignupStep(baseFormData, { organizationType: null });

    expect(errors.organizationType).toBeDefined();
  });

  it("não retorna erro quando o tipo de cadastro foi escolhido", () => {
    const errors = validateSignupStep(baseFormData, ctx);

    expect(errors.organizationType).toBeUndefined();
  });
});

describe("validateNpoStepTwo", () => {
  it("retorna erro quando os dados institucionais obrigatórios estão vazios", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeInstituicao: "",
      cpf: "",
      cnpj: "",
      porteOng: "",
      esg: [],
    };

    const errors = validateNpoStepTwo(data, ctx);

    expect(errors.nomeInstituicao).toBeDefined();
    expect(errors.cpf).toBeDefined();
    expect(errors.porteOng).toBeDefined();
    expect(errors.esg).toBeDefined();
  });

  it("não retorna erro quando os dados institucionais estão válidos", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeInstituicao: "Minha ONG",
      cpf: "529.982.247-25",
      porteOng: "pequena",
      esg: ["social"],
    };

    const errors = validateNpoStepTwo(data, ctx);

    expect(errors.nomeInstituicao).toBeUndefined();
    expect(errors.cpf).toBeUndefined();
    expect(errors.porteOng).toBeUndefined();
    expect(errors.esg).toBeUndefined();
  });
});

describe("validateCpfOrCnpjField", () => {
  it("retorna erro quando CPF e CNPJ estão vazios", () => {
    const data: WizardFormData = { ...baseFormData, cpf: "", cnpj: "" };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeDefined();
  });

  it("não retorna erro quando apenas CPF válido é informado", () => {
    const data: WizardFormData = {
      ...baseFormData,
      cpf: "529.982.247-25",
      cnpj: "",
    };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeUndefined();
    expect(errors.cnpj).toBeUndefined();
  });

  it("não retorna erro quando apenas CNPJ válido é informado", () => {
    const data: WizardFormData = {
      ...baseFormData,
      cpf: "",
      cnpj: "11.444.777/0001-61",
    };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeUndefined();
    expect(errors.cnpj).toBeUndefined();
  });

  it("retorna erro de CPF quando CPF inválido é informado sem CNPJ", () => {
    const data: WizardFormData = {
      ...baseFormData,
      cpf: "111.111.111-11",
      cnpj: "",
    };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeDefined();
  });

  it("retorna erro de CNPJ quando CNPJ inválido é informado sem CPF", () => {
    const data: WizardFormData = {
      ...baseFormData,
      cpf: "",
      cnpj: "00.000.000/0000-00",
    };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cnpj).toBeDefined();
  });
});

describe("validateNpoStepThree", () => {
  it("retorna erro quando zipCode está vazio", () => {
    const data: WizardFormData = {
      ...baseFormData,
      zipCode: "",
      streetNumber: "123",
    };
    const errors = validateNpoStepThree(data, ctx);
    expect(errors.zipCode).toBeDefined();
  });

  it("retorna erro quando zipCode tem menos de 8 dígitos", () => {
    const data: WizardFormData = {
      ...baseFormData,
      zipCode: "0131",
      streetNumber: "123",
    };
    const errors = validateNpoStepThree(data, ctx);
    expect(errors.zipCode).toBeDefined();
  });

  it("retorna erro quando streetNumber está vazio", () => {
    const data: WizardFormData = {
      ...baseFormData,
      zipCode: "01310-100",
      streetNumber: "",
    };
    const errors = validateNpoStepThree(data, ctx);
    expect(errors.streetNumber).toBeDefined();
  });

  it("não retorna erros quando zipCode e streetNumber estão preenchidos", () => {
    const data: WizardFormData = {
      ...baseFormData,
      zipCode: "01310-100",
      streetNumber: "100",
    };
    const errors = validateNpoStepThree(data, ctx);
    expect(errors.zipCode).toBeUndefined();
    expect(errors.streetNumber).toBeUndefined();
  });
});

describe("validateProjectType", () => {
  it("retorna erro quando tipoProjeto está vazio", () => {
    const errors = validateProjectType(baseFormData, ctx);
    expect(errors.tipoProjeto).toBeDefined();
  });

  it("não retorna erro quando tipoProjeto foi selecionado", () => {
    const data: WizardFormData = {
      ...baseFormData,
      tipoProjeto: "social",
    };

    const errors = validateProjectType(data, ctx);
    expect(errors.tipoProjeto).toBeUndefined();
  });
});

describe("validateNpoStepFour", () => {
  it("retorna erro quando os campos obrigatórios do projeto estão vazios", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeProjeto: "",
      tipoProjeto: "",
      descricaoProjeto: "",
      metaCaptacao: "",
      odsProjeto: [],
    };

    const errors = validateNpoStepFour(data, ctx);

    expect(errors.nomeProjeto).toBeDefined();
    expect(errors.tipoProjeto).toBeDefined();
    expect(errors.descricaoProjeto).toBeDefined();
    expect(errors.odsProjeto).toBeDefined();
  });

  it("não exige meta de captação quando o projeto é social", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeProjeto: "Projeto Escola",
      tipoProjeto: "social",
      descricaoProjeto: "Iniciativa para educação básica.",
      metaCaptacao: "",
      odsProjeto: ["1", "3"],
    };

    const errors = validateNpoStepFour(data, ctx);

    expect(errors.nomeProjeto).toBeUndefined();
    expect(errors.tipoProjeto).toBeUndefined();
    expect(errors.descricaoProjeto).toBeUndefined();
    expect(errors.metaCaptacao).toBeUndefined();
    expect(errors.odsProjeto).toBeUndefined();
  });

  it("exige meta de captação quando o projeto é governamental", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeProjeto: "Projeto Escola",
      tipoProjeto: "governamental",
      descricaoProjeto: "Iniciativa para educação básica.",
      metaCaptacao: "",
      odsProjeto: ["1", "3"],
    };

    const errors = validateNpoStepFour(data, ctx);

    expect(errors.metaCaptacao).toBeDefined();
  });

  it("aceita meta de captação válida quando o projeto é governamental", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeProjeto: "Projeto Escola",
      tipoProjeto: "governamental",
      descricaoProjeto: "Iniciativa para educação básica.",
      metaCaptacao: "15000",
      odsProjeto: ["1", "3"],
    };

    const errors = validateNpoStepFour(data, ctx);

    expect(errors.nomeProjeto).toBeUndefined();
    expect(errors.tipoProjeto).toBeUndefined();
    expect(errors.descricaoProjeto).toBeUndefined();
    expect(errors.metaCaptacao).toBeUndefined();
    expect(errors.odsProjeto).toBeUndefined();
  });
});
