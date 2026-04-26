import { render, screen } from "@testing-library/react";
import { ProjectProgress } from "./ProjectProgress";

describe("ProjectProgress", () => {
  it("renderiza o percentual informado", () => {
    render(<ProjectProgress value={75} />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("Conclusão")).toBeInTheDocument();
  });

  it("limita valores acima de 100", () => {
    render(<ProjectProgress value={160} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("limita valores abaixo de 0", () => {
    render(<ProjectProgress value={-10} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
