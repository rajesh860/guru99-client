import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      port: 5175,
    host: true,
    proxy: {
      "/bg": {
        target: "https://guru99.co",
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/bg/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin")
            proxyReq.removeHeader("referer")
          })
        },
      },
      "/socket2": {
        target: "https://socket2.bet99expro.com",
        changeOrigin: true,
        ws: true,
        secure: true,
        rewrite: path => path.replace(/^\/socket2/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("origin", "https://bet99expro.com")
          })
          proxy.on("proxyReqWs", (proxyReq) => {
            proxyReq.setHeader("origin", "https://bet99expro.com")
          })
        },
      },
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  }
})
