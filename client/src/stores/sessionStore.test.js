/**
 * @file Tests pour le store de session
 * @description Vérifie les actions et l'état du store Zustand
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './sessionStore'

describe('Session Store', () => {
  // Réinitialiser le store avant chaque test
  beforeEach(() => {
    useSessionStore.getState().reset()
  })

  // Test 1: Initialisation avec valeurs par défaut
  it('should initialize with default values', () => {
    const state = useSessionStore.getState()
    
    expect(state.sessionId).toBe(null)
    expect(state.isPM).toBe(false)
    expect(state.userName).toBe('')
    expect(state.currentFeatureIndex).toBe(0)
    expect(state.features).toEqual([])
    expect(state.votes).toEqual({})
    expect(state.mode).toBe('strict')
    expect(state.players).toEqual([])
  })

  // Test 2: Définir l'ID de session
  it('should set session ID', () => {
    useSessionStore.getState().setSessionId('ABC123')
    expect(useSessionStore.getState().sessionId).toBe('ABC123')
  })

  // Test 3: Définir le statut PM
  it('should set PM status', () => {
    useSessionStore.getState().setIsPM(true)
    expect(useSessionStore.getState().isPM).toBe(true)
  })

  // Test 4: Définir le nom d'utilisateur
  it('should set user name', () => {
    useSessionStore.getState().setUserName('John Doe')
    expect(useSessionStore.getState().userName).toBe('John Doe')
  })

  // Test 5: Définir le mode
  it('should set game mode', () => {
    useSessionStore.getState().setMode('moyenne')
    expect(useSessionStore.getState().mode).toBe('moyenne')
  })

  // Test 6: Définir les features
  it('should set features', () => {
    const features = [
      { id: 1, name: 'Feature 1' },
      { id: 2, name: 'Feature 2' }
    ]
    
    useSessionStore.getState().setFeatures(features)
    expect(useSessionStore.getState().features).toEqual(features)
  })

  // Test 7: Définir les joueurs
  it('should set players', () => {
    const players = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    
    useSessionStore.getState().setPlayers(players)
    expect(useSessionStore.getState().players).toEqual(players)
  })

  // Test 8: Définir les votes
  it('should set votes', () => {
    const votes = {
      'player1': 5,
      'player2': 8
    }
    
    useSessionStore.getState().setVotes(votes)
    expect(useSessionStore.getState().votes).toEqual(votes)
  })

  // Test 9: Passer à la feature suivante
  it('should go to next feature', () => {
    // Définir d'abord l'index et des votes
    useSessionStore.setState({ currentFeatureIndex: 2, votes: { test: 5 } })
    
    useSessionStore.getState().nextFeature()
    
    const state = useSessionStore.getState()
    expect(state.currentFeatureIndex).toBe(3)
    expect(state.votes).toEqual({})
  })

  // Test 10: Réinitialiser le store
  it('should reset to initial state', () => {
    // Modifier l'état
    useSessionStore.setState({
      sessionId: 'TEST123',
      isPM: true,
      userName: 'Test User',
      currentFeatureIndex: 5,
      features: [{ id: 1, name: 'Test' }],
      votes: { test: 8 },
      mode: 'moyenne',
      players: [{ id: 1, name: 'Player' }]
    })
    
    // Réinitialiser
    useSessionStore.getState().reset()
    
    // Vérifier
    const state = useSessionStore.getState()
    expect(state.sessionId).toBe(null)
    expect(state.isPM).toBe(false)
    expect(state.userName).toBe('')
    expect(state.currentFeatureIndex).toBe(0)
    expect(state.features).toEqual([])
    expect(state.votes).toEqual({})
    expect(state.mode).toBe('strict')
    expect(state.players).toEqual([])
  })

  // Test 11: Incrémentation multiple des features
  it('should increment feature index multiple times', () => {
    useSessionStore.getState().nextFeature()
    expect(useSessionStore.getState().currentFeatureIndex).toBe(1)
    
    useSessionStore.getState().nextFeature()
    expect(useSessionStore.getState().currentFeatureIndex).toBe(2)
    
    useSessionStore.getState().nextFeature()
    expect(useSessionStore.getState().currentFeatureIndex).toBe(3)
  })

  // Test 12: Interactions asynchrones
  it('should handle async updates correctly', async () => {
    // Simuler une mise à jour asynchrone
    const promise = Promise.resolve().then(() => {
      useSessionStore.getState().setUserName('Async User')
    })
    
    await promise
    
    expect(useSessionStore.getState().userName).toBe('Async User')
  })
})