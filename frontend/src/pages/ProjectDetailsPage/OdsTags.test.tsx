import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { OdsTags } from "./OdsTags";

const exactThreshold = ["ODS 1", "ODS 2", "ODS 3", "ODS 4"];
const manyLabels = [
  "ODS 1", "ODS 2", "ODS 3", "ODS 4", "ODS 5",
  "ODS 6", "ODS 7", "ODS 8",
];

describe("OdsTags", () => {
  it("exibe mensagem quando não há ODS", () => {
    render(<OdsTags labels={[]} />);
    expect(screen.getByText("Nenhum ODS vinculado a este projeto.")).toBeInTheDocument();
  });

  it("exibe todas as ODS quando há 4 ou menos (sem botão de expandir)", () => {
    render(<OdsTags labels={exactThreshold} />);
    exactThreshold.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("exibe apenas 3 ODS e chip contador quando há mais de 4", () => {
    render(<OdsTags labels={manyLabels} />);
    expect(screen.getByText("ODS 1")).toBeInTheDocument();
    expect(screen.getByText("ODS 2")).toBeInTheDocument();
    expect(screen.getByText("ODS 3")).toBeInTheDocument();
    expect(screen.queryByText("ODS 4")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+5 ODS/i })).toBeInTheDocument();
  });

  it("exibe todas as ODS ao clicar no chip contador", async () => {
    render(<OdsTags labels={manyLabels} />);
    await userEvent.click(screen.getByRole("button", { name: /\+5 ODS/i }));
    manyLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("mostra botão 'Ver menos' quando expandido", async () => {
    render(<OdsTags labels={manyLabels} />);
    await userEvent.click(screen.getByRole("button", { name: /\+5 ODS/i }));
    expect(screen.getByRole("button", { name: "Ver menos" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /\+/i })).not.toBeInTheDocument();
  });

  it("recolhe ao clicar em 'Ver menos'", async () => {
    render(<OdsTags labels={manyLabels} />);
    await userEvent.click(screen.getByRole("button", { name: /\+5 ODS/i }));
    await userEvent.click(screen.getByRole("button", { name: "Ver menos" }));
    expect(screen.queryByText("ODS 4")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+5 ODS/i })).toBeInTheDocument();
  });

  it("chip contador tem aria-expanded=false e 'Ver menos' tem aria-expanded=true", async () => {
    render(<OdsTags labels={manyLabels} />);
    expect(screen.getByRole("button", { name: /\+5 ODS/i })).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(screen.getByRole("button", { name: /\+5 ODS/i }));
    expect(screen.getByRole("button", { name: "Ver menos" })).toHaveAttribute("aria-expanded", "true");
  });

  it("preserva a ordem original das ODS", () => {
    render(<OdsTags labels={manyLabels} />);
    const chips = screen.getAllByText(/ODS \d/);
    expect(chips[0]).toHaveTextContent("ODS 1");
    expect(chips[1]).toHaveTextContent("ODS 2");
    expect(chips[2]).toHaveTextContent("ODS 3");
  });
});
