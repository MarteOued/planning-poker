import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('devrait rendre sans crasher', () => {
    render(<App />);
    expect(screen.getByText(/Planning Poker/i)).toBeInTheDocument();
  });
});