import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios'],
          ui: ['antd', '@ant-design/icons'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          pdf: ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
})
