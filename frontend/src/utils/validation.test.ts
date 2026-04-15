import { describe, it, expect } from "vitest";
import {
  validateNpoStepThree,
  validateNpoStepFour,
  validateCpfOrCnpjField,
} from "./validation";
import type { WizardFormData } from "../types/wizard.types";

const baseFormData: WizardFormData = {
  nomeInstituicao: "",
  email: "",
  senha: "",
  confirmarSenha: "",
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
};

const ctx = { organizationType: "npo" as const };

describe("validateNpoStepThree", () => {
  it("retorna erro quando esg está vazio", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeInstituicao: "Minha ONG",
      cpf: "529.982.247-25",
      porteOng: "pequena",
      esg: [],
    };
    const errors = validateNpoStepThree(data, ctx);
    expect(errors.esg).toBeDefined();
  });

  it("não retorna erro de esg quando ao menos um pilar está selecionado", () => {
    const data: WizardFormData = {
      ...baseFormData,
      nomeInstituicao: "Minha ONG",
      cpf: "529.982.247-25",
      porteOng: "pequena",
      esg: ["social"],
    };
    const errors = validateNpoStepThree(data, ctx);
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
    const data: WizardFormData = { ...baseFormData, cpf: "529.982.247-25", cnpj: "" };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeUndefined();
    expect(errors.cnpj).toBeUndefined();
  });

  it("não retorna erro quando apenas CNPJ válido é informado", () => {
    const data: WizardFormData = { ...baseFormData, cpf: "", cnpj: "11.444.777/0001-61" };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeUndefined();
    expect(errors.cnpj).toBeUndefined();
  });

  it("retorna erro de CPF quando CPF inválido é informado sem CNPJ", () => {
    const data: WizardFormData = { ...baseFormData, cpf: "111.111.111-11", cnpj: "" };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cpf).toBeDefined();
  });

  it("retorna erro de CNPJ quando CNPJ inválido é informado sem CPF", () => {
    const data: WizardFormData = { ...baseFormData, cpf: "", cnpj: "00.000.000/0000-00" };
    const errors = validateCpfOrCnpjField(data, ctx);
    expect(errors.cnpj).toBeDefined();
  });
});

describe("validateNpoStepFour", () => {
  it("retorna erro quando zipCode está vazio", () => {
    const data: WizardFormData = { ...baseFormData, zipCode: "", streetNumber: "123" };
    const errors = validateNpoStepFour(data, ctx);
    expect(errors.zipCode).toBeDefined();
  });

  it("retorna erro quando zipCode tem menos de 8 dígitos", () => {
    const data: WizardFormData = { ...baseFormData, zipCode: "0131", streetNumber: "123" };
    const errors = validateNpoStepFour(data, ctx);
    expect(errors.zipCode).toBeDefined();
  });

  it("retorna erro quando streetNumber está vazio", () => {
    const data: WizardFormData = { ...baseFormData, zipCode: "01310-100", streetNumber: "" };
    const errors = validateNpoStepFour(data, ctx);
    expect(errors.streetNumber).toBeDefined();
  });

  it("não retorna erros quando zipCode e streetNumber estão preenchidos", () => {
    const data: WizardFormData = { ...baseFormData, zipCode: "01310-100", streetNumber: "100" };
    const errors = validateNpoStepFour(data, ctx);
    expect(errors.zipCode).toBeUndefined();
    expect(errors.streetNumber).toBeUndefined();
  });
});
