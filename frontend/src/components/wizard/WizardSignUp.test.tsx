import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WizardSignUp } from "./WizardSignUp";
import type { WizardFormData } from "../../types/wizard.types";

const loginWithRedirectMock = vi.fn();

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    loginWithRedirect: loginWithRedirectMock,
  }),
}));

const emptyFormData: WizardFormData = {
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

describe("WizardSignUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_AUTH0_AUDIENCE", "https://api.vinculohub");
    window.history.pushState({}, "", "/cadastro");
  });

  it("inclui ui_locales no login", async () => {
    const user = userEvent.setup();

    render(
      <WizardSignUp
        organizationType={null}
        onSelectOrganizationType={vi.fn()}
        formData={emptyFormData}
        setFormData={vi.fn()}
        errors={{}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Já tenho login" }));

    expect(loginWithRedirectMock).toHaveBeenCalledTimes(1);
    expect(loginWithRedirectMock).toHaveBeenCalledWith({
      authorizationParams: {
        ui_locales: "pt-BR",
      },
    });
  });
});
