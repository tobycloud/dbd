import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
    build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const packagePath = id.includes("node_modules/.pnpm")
              ? id.toString().split("node_modules/.pnpm/")[1]
              : id.toString().split("node_modules/")[1];

            return id.includes("node_modules/.pnpm")
              ? (packagePath[0] === "@" ? packagePath.replace("@", "") : packagePath).split("@")[0].toString()
              : packagePath.split("/")[0].toString();
          }

          return id.split("/")[0]
        },
      },
    },
  },
  plugins: [react()], 
});
