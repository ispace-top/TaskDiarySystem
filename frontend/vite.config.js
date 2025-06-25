// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 允许通过网络访问 (用于 Docker 环境)
    port: 3000, // 前端开发服务器端口
    watch: {
      usePolling: true, // 解决 Docker 容器内文件监听问题
    }
  },
  preview: { // Docker 生产环境下，如果使用 `npm run preview`
    host: true,
    port: 3000,
  }
})
