import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': "/src/app",
      '@library': "/src/library",
    },
  },
  plugins: [
    react(),
    // scopeTailwind({react: true})
  ]

})
