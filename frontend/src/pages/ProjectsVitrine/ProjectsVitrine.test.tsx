import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

describe('ProjectsVitrine', () => {
  it('renders lists when projects are available', async () => {
    // use the real mocks (imported by the component)
    const { default: ProjectsVitrine } = await import('./index')

    render(
      <MemoryRouter>
        <ProjectsVitrine />
      </MemoryRouter>
    )

    // match exact headings to avoid overlapping substring matches
    expect(screen.getByRole('heading', { name: 'Todos os Projetos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Todos os Projetos Sugeridos' })).toBeInTheDocument()

    // At least one of the mock project titles should be present
    expect(screen.getByText(/Biblioteca Comunitária Sementes do Saber/i)).toBeInTheDocument()
  })

  it('shows accessible empty state when there are no projects', async () => {
    // Mock the projects module only for this import (doMock avoids hoisting)
    vi.resetModules()
    vi.doMock('../../components/projects/mockProjects', () => ({
      allProjects: [],
      suggestedProjects: [],
    }))

    const { default: ProjectsVitrine } = await import('./index')

    render(
      <MemoryRouter>
        <ProjectsVitrine />
      </MemoryRouter>
    )

    expect(screen.getByText(/Nenhum projeto encontrado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Explorar projetos/i })).toBeInTheDocument()
  })
})
