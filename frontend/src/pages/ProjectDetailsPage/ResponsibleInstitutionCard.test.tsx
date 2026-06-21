import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResponsibleInstitutionCard } from "./ResponsibleInstitutionCard";
import type { ResponsibleInstitution } from "./projectDetails.types";

const baseInstitution: ResponsibleInstitution = {
  name: "Saúde Solidária",
  logoUrl: null,
  city: null,
  stateCode: null,
  description: null,
};

describe("ResponsibleInstitutionCard", () => {
  it("não renderiza nada quando institution é null", () => {
    const { container } = render(<ResponsibleInstitutionCard institution={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza o nome da ONG", () => {
    render(<ResponsibleInstitutionCard institution={baseInstitution} />);
    expect(screen.getByText("Saúde Solidária")).toBeInTheDocument();
  });

  it("renderiza o título da seção", () => {
    render(<ResponsibleInstitutionCard institution={baseInstitution} />);
    expect(screen.getAllByText("Organização Responsável")[0]).toBeInTheDocument();
  });

  it("renderiza a action quando fornecida", () => {
    render(
      <ResponsibleInstitutionCard
        institution={baseInstitution}
        headerAction={<button type="button">Denunciar</button>}
      />,
    );
    expect(screen.getAllByRole("button", { name: "Denunciar" })[0]).toBeInTheDocument();
  });

  it("renderiza descrição quando presente", () => {
    const institution = { ...baseInstitution, description: "ONG focada em saúde." };
    render(<ResponsibleInstitutionCard institution={institution} />);
    expect(screen.getByText("ONG focada em saúde.")).toBeInTheDocument();
  });

  it("não renderiza descrição quando null", () => {
    render(<ResponsibleInstitutionCard institution={baseInstitution} />);
    expect(screen.queryByText(/ONG/)).not.toBeInTheDocument();
  });

  it("renderiza cidade e UF quando ambos presentes", () => {
    const institution = { ...baseInstitution, city: "Recife", stateCode: "PE" };
    render(<ResponsibleInstitutionCard institution={institution} />);
    expect(screen.getByText("Recife, PE")).toBeInTheDocument();
  });

  it("renderiza só a cidade quando stateCode é null", () => {
    const institution = { ...baseInstitution, city: "Recife", stateCode: null };
    render(<ResponsibleInstitutionCard institution={institution} />);
    expect(screen.getByText("Recife")).toBeInTheDocument();
  });

  it("renderiza só o stateCode quando city é null", () => {
    const institution = { ...baseInstitution, city: null, stateCode: "PE" };
    render(<ResponsibleInstitutionCard institution={institution} />);
    expect(screen.getByText("PE")).toBeInTheDocument();
  });

  it("não renderiza linha de localização quando city e stateCode são null", () => {
    render(<ResponsibleInstitutionCard institution={baseInstitution} />);
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it("renderiza img quando logoUrl está presente", () => {
    const institution = {
      ...baseInstitution,
      logoUrl: "https://example.com/logo.png",
    };
    render(<ResponsibleInstitutionCard institution={institution} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
    expect(img).toHaveAttribute("alt", "Saúde Solidária");
  });

  it("renderiza ícone fallback quando logoUrl é null", () => {
    render(<ResponsibleInstitutionCard institution={baseInstitution} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
