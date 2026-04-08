import { render, screen } from '@testing-library/react'
import { FeatureCard } from './FeatureCard'

const defaultProps = {
  title: 'Título do Card',
  description: 'Descrição do card',
  icon: <span data-testid="icon">icon</span>,
  items: ['Item 1', 'Item 2', 'Item 3'],
}

describe('FeatureCard', () => {
  it('renderiza o título', () => {
    render(<FeatureCard {...defaultProps} />)
    expect(screen.getByText('Título do Card')).toBeInTheDocument()
  })

  it('renderiza a descrição', () => {
    render(<FeatureCard {...defaultProps} />)
    expect(screen.getByText('Descrição do card')).toBeInTheDocument()
  })

  it('renderiza todos os items', () => {
    render(<FeatureCard {...defaultProps} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renderiza o ícone passado via prop', () => {
    render(<FeatureCard {...defaultProps} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  describe('theme="ong" (padrão)', () => {
    it('aplica bg-vinculo-green no container do ícone', () => {
      render(<FeatureCard {...defaultProps} />)
      const iconContainer = screen.getByTestId('icon').parentElement
      expect(iconContainer).toHaveClass('bg-vinculo-green')
    })

    it('aplica text-vinculo-green nos ícones de check', () => {
      render(<FeatureCard {...defaultProps} />)
      const checkIcons = document.querySelectorAll('svg[data-testid="CheckOutlinedIcon"]')
      checkIcons.forEach((icon) => {
        expect(icon).toHaveClass('text-vinculo-green')
      })
    })

    it('usa theme "ong" quando theme não é informado', () => {
      render(<FeatureCard {...defaultProps} />)
      const iconContainer = screen.getByTestId('icon').parentElement
      expect(iconContainer).toHaveClass('bg-vinculo-green')
      expect(iconContainer).not.toHaveClass('bg-vinculo-dark')
    })
  })

  describe('theme="empresa"', () => {
    it('aplica bg-vinculo-dark no container do ícone', () => {
      render(<FeatureCard {...defaultProps} theme="empresa" />)
      const iconContainer = screen.getByTestId('icon').parentElement
      expect(iconContainer).toHaveClass('bg-vinculo-dark')
    })

    it('aplica text-vinculo-dark nos ícones de check', () => {
      render(<FeatureCard {...defaultProps} theme="empresa" />)
      const checkIcons = document.querySelectorAll('svg[data-testid="CheckOutlinedIcon"]')
      checkIcons.forEach((icon) => {
        expect(icon).toHaveClass('text-vinculo-dark')
      })
    })

    it('não aplica bg-vinculo-green no container do ícone', () => {
      render(<FeatureCard {...defaultProps} theme="empresa" />)
      const iconContainer = screen.getByTestId('icon').parentElement
      expect(iconContainer).not.toHaveClass('bg-vinculo-green')
    })
  })

  it('renderiza lista vazia sem erros', () => {
    render(<FeatureCard {...defaultProps} items={[]} />)
    expect(screen.getByText('Título do Card')).toBeInTheDocument()
    expect(document.querySelectorAll('svg[data-testid="CheckOutlinedIcon"]')).toHaveLength(0)
  })
})
