import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': "/src",
    },
  },
  plugins: [
    react(),
    // scopeTailwind({react: true})
  ]

})
