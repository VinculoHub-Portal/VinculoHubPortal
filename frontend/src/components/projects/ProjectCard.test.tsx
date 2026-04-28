import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProjectCard from './ProjectCard'

describe('ProjectCard', () => {
  const baseProps = {
    id: 42,
    title: 'Projeto Teste',
    description: 'Descrição do projeto de teste',
    type: 'Lei Rouanet',
    targetAmount: 10000,
    progressPercent: 42,
    location: 'Curitiba, PR',
    ods: ['4'],
  }

  it('renders content and progress', () => {
    render(<ProjectCard {...baseProps} />)

    expect(screen.getByText('Projeto Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição do projeto de teste')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('calls onDetails when clicked or activated with keyboard', () => {
    const onDetails = vi.fn()
    render(<ProjectCard {...baseProps} onDetails={onDetails} />)

    // Click button
    const btn = screen.getByRole('button', { name: /ver detalhes/i })
    fireEvent.click(btn)
    expect(onDetails).toHaveBeenCalledWith(42)

    onDetails.mockClear()

    // Press Enter on the card container
    const article = screen.getByRole('article')
    article.focus()
    fireEvent.keyDown(article, { key: 'Enter' })
    expect(onDetails).toHaveBeenCalledWith(42)
  })
})
