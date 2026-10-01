import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Keep three.js in its own file so it loads only when the 3D parts are needed.
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
          return undefined
        },
      },
    },
  },
})
