import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock pour window.confirm
window.confirm = vi.fn(() => true)

// Mock pour URL.createObjectURL
window.URL.createObjectURL = vi.fn(() => 'mock-url')

// Mock pour document.createElement
const mockClick = vi.fn()
const mockSetAttribute = vi.fn()
const originalCreateElement = document.createElement
document.createElement = vi.fn((tag) => {
  if (tag === 'a') {
    return {
      click: mockClick,
      setAttribute: mockSetAttribute,
      href: '',
      download: ''
    }
  }
  return originalCreateElement.call(document, tag)
})