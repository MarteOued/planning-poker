import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    
    // IMPORTANT: Inclure les fichiers source
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      
      // FIX: Inclure les fichiers src
      include: [
        'src/**/*.{js,jsx,ts,tsx}'
      ],
      
      // FIX: Exclure seulement ce qui est nécessaire
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/test/**',
        '**/*{test,spec}.{js,jsx,ts,tsx}'
      ],
      
    }
  },
  
  // FIX: Résoudre les alias si nécessaire
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})