import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest settings (Session 22 lab setup)
  test: {
    environment: 'jsdom', // a fake browser DOM so components can render
    globals: true, // auto cleanup between tests
    setupFiles: './src/setupTests.js',
  },
})
