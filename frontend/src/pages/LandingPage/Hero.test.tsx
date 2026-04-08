import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('Hero', () => {
  beforeEach(() => {
    render(<Hero />)
  })

  describe('Heading principal', () => {
    it('renderiza o texto "Conectando"', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Conectando')
    })

    it('renderiza o texto "trajetórias"', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('trajetórias')
    })

    it('renderiza o texto "transformam"', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('transformam')
    })
  })

  describe('Parágrafo descritivo principal', () => {
    it('renderiza o texto de descrição da plataforma', () => {
      expect(
        screen.getByText(/Mais que cursos de capacitação/i),
      ).toBeInTheDocument()
    })
  })

  describe('Botão "Sobre Nós"', () => {
    it('renderiza o botão "Sobre Nós"', () => {
      expect(screen.getByRole('button', { name: /sobre nós/i })).toBeInTheDocument()
    })
  })

  describe('Conteúdo mobile', () => {
    it('parágrafo mobile "Conectando pessoas e organizações" está no DOM', () => {
      const paragraphs = screen.getAllByText(/Conectando pessoas e organizações/i)
      expect(paragraphs.length).toBeGreaterThanOrEqual(1)
    })

    it('parágrafo mobile possui a classe md:hidden', () => {
      const mobileParagraph = screen
        .getAllByText(/Conectando pessoas e organizações/i)
        .find((el) => el.classList.contains('md:hidden'))
      expect(mobileParagraph).toBeDefined()
      expect(mobileParagraph).toHaveClass('md:hidden')
    })
  })

  describe('Conteúdo desktop', () => {
    it('texto "Gestão + Capacitação!" está no DOM', () => {
      expect(screen.getByText(/Gestão \+ Capacitação!/i)).toBeInTheDocument()
    })

    it('parágrafo desktop "Conectando pessoas e organizações" está no DOM', () => {
      const paragraphs = screen.getAllByText(/Conectando pessoas e organizações/i)
      const desktopParagraph = paragraphs.find(
        (el) => !el.classList.contains('md:hidden'),
      )
      expect(desktopParagraph).toBeDefined()
    })
  })
})
