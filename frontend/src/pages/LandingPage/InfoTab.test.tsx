import { render, screen } from '@testing-library/react'
import { InfoTab } from './InfoTab'

describe('InfoTab', () => {
  beforeEach(() => {
    render(<InfoTab />)
  })

  describe('Cabeçalho da seção', () => {
    it('renderiza o título "Plataforma Completa de Gestão"', () => {
      expect(
        screen.getByRole('heading', { name: /Plataforma Completa de Gestão/i }),
      ).toBeInTheDocument()
    })

    it('renderiza o parágrafo descritivo da seção', () => {
      expect(screen.getByText(/A Vínculo é uma solução completa/i)).toBeInTheDocument()
    })
  })

  describe('FeatureCard — Para ONGs e OSCs', () => {
    it('renderiza o título do card de ONGs', () => {
      expect(screen.getByText('Para ONGs e OSCs')).toBeInTheDocument()
    })

    it('renderiza a descrição do card de ONGs', () => {
      expect(
        screen.getByText(/Simplifique a gestão da sua organização/i),
      ).toBeInTheDocument()
    })

    it('renderiza o item "Gestão de projetos e atividades diárias"', () => {
      expect(screen.getByText('Gestão de projetos e atividades diárias')).toBeInTheDocument()
    })

    it('renderiza o item "Controle financeiro e prestação de contas"', () => {
      expect(screen.getByText('Controle financeiro e prestação de contas')).toBeInTheDocument()
    })

    it('renderiza o item "Gestão de voluntários e equipe"', () => {
      expect(screen.getByText('Gestão de voluntários e equipe')).toBeInTheDocument()
    })

    it('renderiza o item "Captação de recursos e relacionamento com doadores"', () => {
      expect(
        screen.getByText('Captação de recursos e relacionamento com doadores'),
      ).toBeInTheDocument()
    })

    it('renderiza o item "Medição e relatórios de impacto"', () => {
      expect(screen.getByText('Medição e relatórios de impacto')).toBeInTheDocument()
    })
  })

  describe('FeatureCard — Para Empresas', () => {
    it('renderiza o título do card de Empresas', () => {
      expect(screen.getByText('Para Empresas')).toBeInTheDocument()
    })

    it('renderiza a descrição do card de Empresas', () => {
      expect(
        screen.getByText(/Gerencie suas iniciativas de responsabilidade social/i),
      ).toBeInTheDocument()
    })

    it('renderiza o item "Gestão de programas de investimento social"', () => {
      expect(screen.getByText('Gestão de programas de investimento social')).toBeInTheDocument()
    })

    it('renderiza o item "Monitoramento de projetos apoiados"', () => {
      expect(screen.getByText('Monitoramento de projetos apoiados')).toBeInTheDocument()
    })

    it('renderiza o item "Engajamento de colaboradores em voluntariado"', () => {
      expect(
        screen.getByText('Engajamento de colaboradores em voluntariado'),
      ).toBeInTheDocument()
    })

    it('renderiza o item "Relatórios de impacto ESG"', () => {
      expect(screen.getByText('Relatórios de impacto ESG')).toBeInTheDocument()
    })

    it('renderiza o item "Conexão com organizações alinhadas aos valores da empresa"', () => {
      expect(
        screen.getByText(
          'Conexão com organizações alinhadas aos valores da empresa',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Layout responsivo', () => {
    it('grid de cards possui a classe md:grid-cols-2 para layout desktop', () => {
      const grid = document
        .querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('parágrafo descritivo possui a classe md:text-xl para tamanho maior no desktop', () => {
      const descParagraph = screen.getByText(/A Vínculo é uma solução completa/i)
      expect(descParagraph).toHaveClass('md:text-xl')
    })
  })
})
