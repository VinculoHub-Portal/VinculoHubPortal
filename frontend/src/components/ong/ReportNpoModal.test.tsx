import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportNpoModal } from "./ReportNpoModal";

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  createNpoReportMock: vi.fn(),
  showToastMock: vi.fn(),
  onCloseMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/npoReports", () => ({
  createNpoReport: mocks.createNpoReportMock,
}));

vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({
    showToast: mocks.showToastMock,
  }),
}));

describe("ReportNpoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.createNpoReportMock.mockResolvedValue({ id: 1 });
  });

  it("renderiza o formulário quando aberto", () => {
    render(<ReportNpoModal npoId={10} open onClose={mocks.onCloseMock} />);

    expect(screen.getByRole("dialog", { name: "Denunciar ONG" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo da suspeita/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar Campos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar denúncia" })).toBeInTheDocument();
  });

  it("não envia quando o motivo é curto", async () => {
    const user = userEvent.setup();
    render(<ReportNpoModal npoId={10} open onClose={mocks.onCloseMock} />);

    await user.type(screen.getByLabelText(/Motivo da suspeita/), "curto");
    await user.click(screen.getByRole("button", { name: "Enviar denúncia" }));

    expect(
      screen.getByText("Descreva o motivo com pelo menos 10 caracteres."),
    ).toBeInTheDocument();
    expect(mocks.createNpoReportMock).not.toHaveBeenCalled();
  });

  it("envia denúncia válida e fecha o modal", async () => {
    const user = userEvent.setup();
    render(<ReportNpoModal npoId={10} open onClose={mocks.onCloseMock} />);

    await user.type(
      screen.getByLabelText(/Motivo da suspeita/),
      "Documentos apresentados parecem inconsistentes.",
    );
    await user.click(screen.getByRole("button", { name: "Enviar denúncia" }));

    await waitFor(() =>
      expect(mocks.createNpoReportMock).toHaveBeenCalledWith(
        10,
        { reason: "Documentos apresentados parecem inconsistentes." },
        "token",
      ),
    );
    expect(mocks.showToastMock).toHaveBeenCalledWith(
      "Denúncia enviada para análise do administrador.",
      "success",
    );
    expect(mocks.onCloseMock).toHaveBeenCalled();
  }, 10000);

  it("mantém modal aberto e mostra feedback quando a API falha", async () => {
    const user = userEvent.setup();
    mocks.createNpoReportMock.mockRejectedValue(new Error("Falha"));
    render(<ReportNpoModal npoId={10} open onClose={mocks.onCloseMock} />);

    await user.type(
      screen.getByLabelText(/Motivo da suspeita/),
      "Documentos apresentados parecem inconsistentes.",
    );
    await user.click(screen.getByRole("button", { name: "Enviar denúncia" }));

    await waitFor(() =>
      expect(mocks.showToastMock).toHaveBeenCalledWith(
        "Não foi possível enviar a denúncia. Tente novamente.",
        "error",
      ),
    );
    expect(mocks.onCloseMock).not.toHaveBeenCalled();
  }, 10000);
});
