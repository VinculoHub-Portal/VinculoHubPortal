import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { OngPublicProfilePage } from "."

function renderPage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/ong/publico/${slug}`]}>
      <Routes>
        <Route path="/ong/publico/:slug" element={<OngPublicProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OngPublicProfilePage", () => {
  it("renderiza o perfil público com slug válido", () => {
    renderPage("instituto-educacao")

    expect(screen.getByText("Instituto Educação para Todos")).toBeInTheDocument()
    expect(screen.getByText("(ONG I)")).toBeInTheDocument()
    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument()
    expect(screen.getByText("Maria Silva Santos")).toBeInTheDocument()
    expect(screen.getByText(/Nossa organização está comprometida/)).toBeInTheDocument()
  })

  it("não exibe botão 'Editar Perfil' no perfil público", () => {
    renderPage("instituto-educacao")

    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument()
  })

  it("não exibe o card 'Perfil Público' na página pública", () => {
    renderPage("instituto-educacao")

    expect(screen.queryByLabelText("Link do perfil público")).not.toBeInTheDocument()
  })

  it("exibe estado de erro com slug inválido", () => {
    renderPage("slug-inexistente")

    expect(screen.getByText("Perfil não encontrado")).toBeInTheDocument()
  })
})
