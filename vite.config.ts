
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom plugin to print external link
function printExternalLink() {
  return {
    name: 'print-external-link',
    configureServer(server: ViteDevServer) {
      server.httpServer?.once('listening', () => {
        const address = '37.63.102.216';
        const port = server.config.server.port || 8080;
        // eslint-disable-next-line no-console
        console.log(`\u001b[32m\nApp is accessible externally at: http://${address}:${port}\n\u001b[0m`);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    printExternalLink(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
}));
