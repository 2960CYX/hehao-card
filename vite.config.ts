import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

/**
 * GitHub Pages 的 base 路径：
 * - 项目站点  https://<user>.github.io/<repo>/   → base 必须是 "/<repo>/"
 * - 用户站点  https://<user>.github.io/          → base 必须是 "/"
 * 本地 dev / preview 一律用 "/"。
 */
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserSite = repo.toLowerCase().endsWith('.github.io')
const base = process.env.GITHUB_ACTIONS && repo && !isUserSite ? `/${repo}/` : '/'

export default defineConfig({
  base,
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2019',
    cssTarget: 'chrome80'
  },
  server: {
    host: true,
    port: 5173
  }
})
