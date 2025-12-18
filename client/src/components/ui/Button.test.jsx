/**
 * @file Tests pour le composant Button
 * @description Vérifie le comportement du bouton personnalisé
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  // Test 1: Rendu de base
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  // Test 2: Click handler
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // Test 3: Évite la propagation du clic
  it('should stop propagation on click', () => {
    const parentClick = vi.fn()
    const buttonClick = vi.fn()
    
    render(
      <div onClick={parentClick}>
        <Button onClick={buttonClick}>Test</Button>
      </div>
    )
    
    fireEvent.click(screen.getByText('Test'))
    expect(buttonClick).toHaveBeenCalledTimes(1)
    expect(parentClick).not.toHaveBeenCalled()
  })

  // Test 4: Bouton désactivé
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  // Test 5: Bouton désactivé ne déclenche pas onClick
  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    fireEvent.click(screen.getByText('Disabled'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // Test 6: Variantes - CORRIGÉ
  it('should have primary variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('from-blue-500')
    expect(button).toHaveClass('to-purple-500')
    expect(button).toHaveClass('text-white')
  })

  it('should have secondary variant classes', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('bg-white')
    expect(button).toHaveClass('border-blue-300')
    expect(button).toHaveClass('text-blue-600')
  })

  it('should have danger variant classes', () => {
    const { container } = render(<Button variant="danger">Danger</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('from-red-500')
    expect(button).toHaveClass('to-pink-500')
    expect(button).toHaveClass('text-white')
  })

  it('should have success variant classes', () => {
    const { container } = render(<Button variant="success">Success</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('from-emerald-500')
    expect(button).toHaveClass('to-teal-500')
    expect(button).toHaveClass('text-white')
  })

  it('should have warning variant classes', () => {
    const { container } = render(<Button variant="warning">Warning</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('from-amber-500')
    expect(button).toHaveClass('to-orange-500')
    expect(button).toHaveClass('text-white')
  })

  it('should have ghost variant classes', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('bg-transparent')
    expect(button).toHaveClass('text-blue-600')
  })

  // Test 7: Tailles 
  it('should have small size classes', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-1.5')
    expect(button).toHaveClass('text-sm')
  })

  it('should have medium size classes', () => {
    const { container } = render(<Button size="md">Medium</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
    expect(button).toHaveClass('text-base')
  })

  it('should have large size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
    expect(button).toHaveClass('text-lg')
  })

  // Test 8: Pleine largeur
  it('should have full width when fullWidth prop is true', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('w-full')
  })

  // Test 9: Avec icône
  it('should render icon when provided', () => {
    const MockIcon = () => <svg data-testid="icon" />
    render(<Button icon={MockIcon}>With Icon</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  // Test 10: Type de bouton
  it('should have correct button type', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit')
  })

  // Test 11: Classes de base présentes
  it('should have base classes', () => {
    const { container } = render(<Button>Base</Button>)
    const button = container.firstChild
    expect(button).toHaveClass('font-semibold')
    expect(button).toHaveClass('rounded-xl')
    expect(button).toHaveClass('transition-all')
  })
})