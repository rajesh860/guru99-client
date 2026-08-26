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
      "/mycricket": {
        target: "https://api.mycricketapi.com",
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/mycricket/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("referer", "https://www.cricketguru.com/")
            proxyReq.setHeader("origin", "https://www.cricketguru.com")
            proxyReq.setHeader("authorization", "Basic Y3JpYzM2MGRldmxpdmU6Y0g0YkhzZ3hubkNoODVKclVnOGo=")
            proxyReq.setHeader("platform", "93")
            proxyReq.setHeader("version", "5.10.2")
            proxyReq.setHeader("cache-control", "no-cache, no-store, must-revalidate")
            proxyReq.setHeader("pragma", "no-cache, no-store, must-revalidate")
            proxyReq.setHeader("if-modified-since", "0")
            proxyReq.setHeader("user-agent", "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36")
            proxyReq.setHeader("timestamp", String(Date.now()))
          })
        },
      },
      "/cricbuzz": {
        target: "https://www.cricbuzz.com",
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/cricbuzz/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("referer", "https://www.cricbuzz.com/live-cricket-scores/151107")
            proxyReq.setHeader("origin", "https://www.cricbuzz.com")
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
