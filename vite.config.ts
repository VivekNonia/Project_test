import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix: Expose API_KEY to client-side code to comply with Gemini API guidelines.
  // This safely makes `process.env.API_KEY` available in the app.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
