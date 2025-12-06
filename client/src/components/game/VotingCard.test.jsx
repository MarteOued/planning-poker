/**
 * @file Tests pour le composant VotingCard
 * @description Vérifie le comportement des cartes de vote
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VotingCard from './VotingCard'

// Mock simple pour éviter les problèmes d'images
vi.mock('/cartes/0.png', () => 'mock-0.png')
vi.mock('/cartes/1.png', () => 'mock-1.png')
vi.mock('/cartes/2.png', () => 'mock-2.png')
vi.mock('/cartes/3.png', () => 'mock-3.png')
vi.mock('/cartes/5.png', () => 'mock-5.png')
vi.mock('/cartes/8.png', () => 'mock-8.png')
vi.mock('/cartes/13.png', () => 'mock-13.png')
vi.mock('/cartes/20.png', () => 'mock-20.png')
vi.mock('/cartes/40.png', () => 'mock-40.png')
vi.mock('/cartes/100.png', () => 'mock-100.png')
vi.mock('/cartes/cartes_interro.png', () => 'mock-question.png')
vi.mock('/cartes/cafe.png', () => 'mock-coffee.png')

// Mock pour framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, ...props }) => (
      <div 
        onClick={onClick} 
        className={className}
        {...props}
        data-testid="motion-div"
      >
        {children}
      </div>
    )
  }
}))

describe('VotingCard Component', () => {
  // Test 1: Rendu de base
  it('should render card with value', () => {
    render(<VotingCard value={5} />)
    const img = screen.getByAltText('Carte 5')
    expect(img).toBeInTheDocument()
  })

  // Test 2: Click handler fonctionne quand pas désactivé
  it('should call onClick when clicked and not disabled', () => {
    const handleClick = vi.fn()
    render(<VotingCard value={5} onClick={handleClick} />)
    
    // Clique sur le conteneur (pas l'image)
    const container = screen.getByTestId('motion-div')
    fireEvent.click(container)
    expect(handleClick).toHaveBeenCalledWith(5)
  })

  // Test 3: CORRECTION - Carte désactivée ne déclenche pas onClick
  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<VotingCard value={5} isDisabled onClick={handleClick} />)
    
    const container = screen.getByTestId('motion-div')
    fireEvent.click(container)
    expect(handleClick).not.toHaveBeenCalled()
  })

  // Test 4: Carte sélectionnée
  it('should have selected styles when isSelected is true', () => {
    render(<VotingCard value={8} isSelected />)
    const container = screen.getByTestId('motion-div')
    
    // Vérifie les classes
    expect(container.className).toContain('ring-4')
    expect(container.className).toContain('scale-105')
    expect(container.className).toContain('ring-primary')
  })

  // Test 5: Carte non sélectionnée
  it('should have default styles when not selected', () => {
    render(<VotingCard value={8} />)
    const container = screen.getByTestId('motion-div')
    expect(container.className).toContain('ring-2')
    expect(container.className).toContain('ring-gray-600')
  })

  // Test 6: CORRECTION - Carte désactivée a les bons styles
  it('should have disabled styles when isDisabled is true', () => {
    render(<VotingCard value={13} isDisabled />)
    const container = screen.getByTestId('motion-div')
    
    // Le prop est isDisabled, pas disabled
    expect(container.className).toContain('grayscale')
    expect(container.className).toContain('opacity-50')
    expect(container.className).toContain('cursor-not-allowed')
  })

  // Test 7: Carte non désactivée est cliquable
  it('should have pointer cursor when not disabled', () => {
    render(<VotingCard value={20} />)
    const container = screen.getByTestId('motion-div')
    expect(container.className).toContain('cursor-pointer')
  })

  // Test 8: Toutes les valeurs sont supportées
  const testValues = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?', '☕']
  
  testValues.forEach(value => {
    it(`should render card with value ${value}`, () => {
      const { unmount } = render(<VotingCard value={value} />)
      expect(screen.getByAltText(`Carte ${value}`)).toBeInTheDocument()
      unmount()
    })
  })

  // Test 9: Les props sont bien passées
  it('should pass the value to onClick', () => {
    const handleClick = vi.fn()
    render(<VotingCard value="?" onClick={handleClick} />)
    
    const container = screen.getByTestId('motion-div')
    fireEvent.click(container)
    expect(handleClick).toHaveBeenCalledWith('?')
  })

  // Test 10: Transition classes présentes
  it('should have transition classes', () => {
    render(<VotingCard value={1} />)
    const container = screen.getByTestId('motion-div')
    expect(container.className).toContain('transition-all')
    expect(container.className).toContain('duration-200')
  })
})