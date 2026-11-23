/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'
  return {
    plugins: [react()],
    server: {
      // 백엔드에 CORS 설정이 없어서 개발 중에는 /api/* 를 프록시로 넘긴다. (/api/health → /health)
      proxy: {
        '/api': { target, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      },
    },
    test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
  }
})
