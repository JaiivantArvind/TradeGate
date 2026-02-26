import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    proxy: {
      '/calculate': 'http://localhost:5000',
    },
  },
  build: {
    outDir: '../dist',
  },
})
