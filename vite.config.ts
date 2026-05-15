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
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  }
})
