import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { CompanyRow } from "./CompanyRow"

const baseCompany = {
  id: 7,
  legalName: "ACME LTDA",
  socialName: "ACME",
  description: null,
  logoUrl: null,
  city: "São Paulo",
  state: "SP",
}

function renderRow() {
  return render(
    <MemoryRouter initialEntries={["/ong/dashboard"]}>
      <Routes>
        <Route path="/ong/dashboard" element={<CompanyRow company={baseCompany} />} />
        <Route
          path="/empresa/publico/:companyId"
          element={<p data-testid="public-profile-page" />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe("CompanyRow", () => {
  it("renderiza nome e localização da empresa", () => {
    renderRow()
    expect(screen.getByText("ACME LTDA")).toBeInTheDocument()
    expect(screen.getByText("ACME")).toBeInTheDocument()
    expect(screen.getByText(/São Paulo, SP/)).toBeInTheDocument()
  })

  it('clicar em "Ver perfil" navega para /empresa/publico/:id', async () => {
    const user = userEvent.setup()
    renderRow()

    await user.click(screen.getByRole("button", { name: /ver perfil de ACME LTDA/i }))

    expect(screen.getByTestId("public-profile-page")).toBeInTheDocument()
  })
})
