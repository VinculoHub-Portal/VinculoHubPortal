import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProjectCard from './ProjectCard'

describe('ProjectCard', () => {
  const baseProps = {
    id: 42,
    title: 'Projeto Teste',
    description: 'Descrição do projeto de teste',
  }

  it('renderiza título e descrição', () => {
    render(<ProjectCard {...baseProps} />)
    expect(screen.getByText('Projeto Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição do projeto de teste')).toBeInTheDocument()
  })

  it('esconde descrição quando não fornecida', () => {
    render(<ProjectCard id={1} title="Sem desc" />)
    expect(screen.queryByText('Sem desc')).toBeInTheDocument()
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('mostra badge de valor e progresso em lei-incentivo', () => {
    render(<ProjectCard {...baseProps} fundingType="lei-incentivo" targetAmount={100000} progressPercent={42} />)
    expect(screen.getByText(/100\.000/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('mostra progresso 0% quando progressPercent não vem do backend', () => {
    render(<ProjectCard {...baseProps} fundingType="lei-incentivo" targetAmount={50000} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('esconde badge de valor quando targetAmount é null em lei-incentivo', () => {
    render(<ProjectCard {...baseProps} fundingType="lei-incentivo" targetAmount={null} />)
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
  })

  it('não mostra badge nem progresso em investimento-social-privado', () => {
    render(<ProjectCard {...baseProps} fundingType="investimento-social-privado" targetAmount={50000} progressPercent={60} />)
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('chama onDetails ao clicar no botão e ao pressionar Enter no card', () => {
    const onDetails = vi.fn()
    render(<ProjectCard {...baseProps} onDetails={onDetails} />)

    fireEvent.click(screen.getByRole('button', { name: /ver detalhes/i }))
    expect(onDetails).toHaveBeenCalledWith(42)

    onDetails.mockClear()
    fireEvent.keyDown(screen.getByRole('article'), { key: 'Enter' })
    expect(onDetails).toHaveBeenCalledWith(42)
  })
})
