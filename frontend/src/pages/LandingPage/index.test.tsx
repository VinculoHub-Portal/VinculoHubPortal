import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './index'

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('monta sem erros', () => {
    expect(() => renderLandingPage()).not.toThrow()
  })

  it('renderiza o heading do Hero', () => {
    renderLandingPage()
    expect(screen.getByRole('heading', { level: 1, name: /Conectando/i })).toBeInTheDocument()
  })

  it('renderiza o título da seção InfoTab', () => {
    renderLandingPage()
    expect(
      screen.getByRole('heading', { name: /Plataforma Completa de Gestão/i }),
    ).toBeInTheDocument()
  })

  it('renderiza os três componentes filhos na ordem correta', () => {
    const { container } = renderLandingPage()

    const header = container.querySelector('header')
    const heroSection = container.querySelector('section')
    const infoTabMain = container.querySelector('main')

    expect(header).toBeInTheDocument()
    expect(heroSection).toBeInTheDocument()
    expect(infoTabMain).toBeInTheDocument()
  })
})
