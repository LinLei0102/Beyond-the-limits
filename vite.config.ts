import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站点路径：https://linlei0102.github.io/Beyond-the-limits/
  base: "/Beyond-the-limits/",
  plugins: [vue()],
})
