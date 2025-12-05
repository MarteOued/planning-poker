import { create } from 'zustand'

export const useSessionStore = create((set) => ({
  // Session info
  sessionId: null,
  isPM: false,
  userName: '',
  
  // Game state
  currentFeatureIndex: 0,
  features: [],
  votes: {},
  mode: 'strict', // 'strict' ou 'moyenne'
  players: [],
  
  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setIsPM: (isPM) => set({ isPM }),
  setUserName: (name) => set({ userName: name }),
  setMode: (mode) => set({ mode }),
  setFeatures: (features) => set({ features }),
  setPlayers: (players) => set({ players }),
  setVotes: (votes) => set({ votes }),
  nextFeature: () => set((state) => ({ 
    currentFeatureIndex: state.currentFeatureIndex + 1,
    votes: {} 
  })),
  reset: () => set({
    sessionId: null,
    isPM: false,
    userName: '',
    currentFeatureIndex: 0,
    features: [],
    votes: {},
    mode: 'strict',
    players: []
  })
}))