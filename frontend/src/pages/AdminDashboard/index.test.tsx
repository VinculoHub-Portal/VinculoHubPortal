import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminDashboard } from "./index";

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

describe("AdminDashboard", () => {
  it("renderiza o cabeçalho e o título da página", () => {
    render(<AdminDashboard />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Painel administrativo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Gerencie usuários, organizações e configurações da plataforma.",
      ),
    ).toBeInTheDocument();
  });

  it("renderiza as métricas principais do dashboard", () => {
    render(<AdminDashboard />);

    expect(
      screen.getByRole("article", { name: "Total de ONGs: 87" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Editais Publicados: 24" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Vínculos Ativos: 156" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Notificações Pendentes: 5" }),
    ).toBeInTheDocument();
  });

  it("renderiza as ações do topo", () => {
    render(<AdminDashboard />);

    expect(
      screen.getByRole("button", { name: "Cadastrar Edital" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Exportar Dados" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver Denúncias" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mediações" }),
    ).toBeInTheDocument();
  });
});
