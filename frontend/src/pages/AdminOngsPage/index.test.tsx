import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminOngsPage } from "./index";

const mocks = vi.hoisted(() => ({
  getAccessTokenSilentlyMock: vi.fn(),
  fetchAdminNposMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: mocks.getAccessTokenSilentlyMock,
  }),
}));

vi.mock("../../api/admin", () => ({
  fetchAdminNpos: mocks.fetchAdminNposMock,
}));

vi.mock("../../components/general/Header", () => ({
  Header: () => <header data-testid="header" />,
}));

const mockNpo = {
  id: 42,
  name: "ONG Verde",
  logoUrl: null,
  active: true,
  environmental: true,
  social: false,
  governance: true,
  city: "Porto Alegre",
  stateCode: "RS",
  createdAt: "2026-05-29T12:00:00",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminOngsPage />
    </MemoryRouter>,
  );
}

describe("AdminOngsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      configurable: true,
    });
    mocks.getAccessTokenSilentlyMock.mockResolvedValue("token");
    mocks.fetchAdminNposMock.mockResolvedValue({
      content: [mockNpo],
      totalElements: 1,
      totalPages: 2,
      number: 0,
      size: 12,
      first: true,
      last: false,
    });
  });

  it("renderiza as ONGs cadastradas e permite paginar", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("ONGs cadastradas")).toBeInTheDocument();
    const cardTitle = await screen.findByText("ONG Verde");
    expect(cardTitle).toBeInTheDocument();
    const card = cardTitle.closest("article");
    expect(card).not.toBeNull();
    expect(screen.getByText("Porto Alegre - RS")).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
    expect(within(card!).getByText("Ambiental")).toBeInTheDocument();
    expect(within(card!).getByText("Governança")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver perfil público" })).toHaveAttribute(
      "href",
      "/ong/publico/42",
    );

    await user.click(screen.getByRole("button", { name: "Próxima página" }));

    await waitFor(() =>
      expect(mocks.fetchAdminNposMock).toHaveBeenLastCalledWith("token", {
        search: undefined,
        area: "all",
        status: "all",
        page: 1,
        size: 12,
      }),
    );
  });
});
