import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const serverEnv = loadEnv(mode, resolve(process.cwd(), '../server'), '')
  const rootEnv = loadEnv(mode, resolve(process.cwd(), '..'), '')
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim()
  const backendPort = Number(serverEnv.PORT || rootEnv.PORT || process.env.PORT || env.PORT || 4000)

  return {
    plugins: [react()],
    server: {
      port: Number(process.env.VITE_PORT || rootEnv.VITE_PORT || env.VITE_PORT || '5175'),
      proxy: apiBaseUrl ? undefined : {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
