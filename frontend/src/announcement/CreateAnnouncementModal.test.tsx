import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateNoticeModal } from "./CreateAnnouncementModal";

const mocks = vi.hoisted(() => ({
  apiPostMock: vi.fn(),
  getAccessTokenSilentlyMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../services/api", () => ({
  api: {
    post: mocks.apiPostMock,
  },
}));

function renderModal(
  props: Partial<React.ComponentProps<typeof CreateNoticeModal>> = {},
) {
  const onClose = vi.fn();
  const result = render(
    <CreateNoticeModal open onClose={onClose} {...props} />,
  );

  return {
    ...result,
    onClose: props.onClose ?? onClose,
  };
}

async function fillValidForm(container: HTMLElement) {
  const user = userEvent.setup();
  const file = new File(["edital"], "edital.pdf", {
    type: "application/pdf",
  });

  await user.type(
    screen.getByLabelText(/Título do Edital/i),
    "Edital de Cultura 2026",
  );
  await user.type(
    screen.getByLabelText(/Descrição/i),
    "Edital para apoio a iniciativas culturais.",
  );
  fireEvent.change(screen.getByLabelText(/Prazo de Inscrição/i), {
    target: { value: "2026-12-31" },
  });
  await user.selectOptions(
    screen.getByRole("combobox", { name: /Categoria\/ODS/i }),
    "4",
  );
  await user.upload(
    container.querySelector('input[type="file"]') as HTMLInputElement,
    file,
  );

  return { file, user };
}

describe("CreateNoticeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token-admin");
    mocks.apiPostMock.mockResolvedValue({ data: { id: 1 } });
  });

  it("não renderiza quando open é false", () => {
    const { container } = render(
      <CreateNoticeModal open={false} onClose={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza os campos principais e erro recebido por prop", () => {
    renderModal({ submitError: "Falha externa" });

    expect(
      screen.getByRole("dialog", { name: "Cadastrar Novo Edital" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Título do Edital/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Prazo de Inscrição/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /Categoria\/ODS/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Falha externa");
  });

  it("exibe erros de validação ao tentar publicar vazio", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      screen.getByRole("button", { name: /Publicar Edital/i }),
    );

    expect(screen.getByText("Informe o título.")).toBeInTheDocument();
    expect(screen.getByText("Informe a descrição.")).toBeInTheDocument();
    expect(screen.getByText("Informe o prazo.")).toBeInTheDocument();
    expect(screen.getByText("Selecione uma categoria.")).toBeInTheDocument();
    expect(screen.getByText("Envie um arquivo.")).toBeInTheDocument();
    expect(mocks.getAccessTokenSilentlyMock).not.toHaveBeenCalled();
    expect(mocks.apiPostMock).not.toHaveBeenCalled();
  });

  it("rejeita formato de arquivo incompatível com o backend", async () => {
    const { container } = renderModal();
    const { user } = await fillValidForm(container);

    fireEvent.change(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      {
        target: {
          files: [
            new File(["texto"], "edital.txt", {
              type: "text/plain",
            }),
          ],
        },
      },
    );
    await user.click(
      screen.getByRole("button", { name: /Publicar Edital/i }),
    );

    expect(
      screen.getByText("Formato inválido. Utilize PDF, DOC ou DOCX."),
    ).toBeInTheDocument();
    expect(mocks.apiPostMock).not.toHaveBeenCalled();
  });

  it("envia multipart para POST /api/editais com token Auth0", async () => {
    const { container, onClose } = renderModal();
    const { file, user } = await fillValidForm(container);

    await user.click(
      screen.getByRole("button", { name: /Publicar Edital/i }),
    );

    await waitFor(() => expect(mocks.apiPostMock).toHaveBeenCalledOnce());

    const [url, formData, config] = mocks.apiPostMock.mock.calls[0];
    expect(url).toBe("/api/editais");
    expect(config).toEqual({
      headers: { Authorization: "Bearer token-admin" },
    });
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(
      JSON.parse(await (formData.get("data") as Blob).text()),
    ).toEqual({
      title: "Edital de Cultura 2026",
      description: "Edital para apoio a iniciativas culturais.",
      odsIds: [4],
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("usa onSubmit customizado quando informado", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container, onClose } = renderModal({ onSubmit });
    const { user } = await fillValidForm(container);

    await user.click(
      screen.getByRole("button", { name: /Publicar Edital/i }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0]).toBeInstanceOf(FormData);
    expect(mocks.getAccessTokenSilentlyMock).not.toHaveBeenCalled();
    expect(mocks.apiPostMock).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("mantém o modal aberto e exibe erro quando a request falha", async () => {
    mocks.apiPostMock.mockRejectedValue(new Error("Network error"));
    const { container, onClose } = renderModal();
    const { user } = await fillValidForm(container);

    await user.click(
      screen.getByRole("button", { name: /Publicar Edital/i }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/publicar o edital/i);
    expect(onClose).not.toHaveBeenCalled();
  });
});
