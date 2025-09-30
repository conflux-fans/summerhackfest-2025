import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3002",
        ws: true,
      },
      // Proxy for Conflux RPC to avoid CORS issues
      "/rpc/conflux": {
        target: "https://evm.confluxrpc.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/conflux/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Add CORS headers for preflight requests
            proxyReq.setHeader("Access-Control-Allow-Origin", "*");
            proxyReq.setHeader(
              "Access-Control-Allow-Methods",
              "GET, POST, PUT, DELETE, OPTIONS"
            );
            proxyReq.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization"
            );
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  define: {
    global: "globalThis",
  },
});
