import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import type { ProjectListItem } from "../../types/project.types";

const project: ProjectListItem = {
  id: "education-transformadora",
  name: "Educação Transformadora",
  description: "Programa de reforço escolar para jovens em vulnerabilidade.",
  status: "active",
  type: "tax_incentive_law",
  city: "São Paulo",
  state: "SP",
  progress: 75,
  tags: ["Educação", "Capacitação"],
};

describe("ProjectCard", () => {
  it("renderiza os dados principais do projeto", () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByText("Educação Transformadora")).toBeInTheDocument();
    expect(screen.getByText("Leis de Incentivo")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renderiza as tags e o botão de ação", () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByText("Educação")).toBeInTheDocument();
    expect(screen.getByText("Capacitação")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver detalhes/i }),
    ).toBeInTheDocument();
  });
});
