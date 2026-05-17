// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tailwindcss()
    ],
    resolve: {
      alias: [
        // @/arkzen/core/adapters → this stack's own adapters (most specific first)
        {
          find: "@/arkzen/core/adapters",
          replacement: path.resolve(import.meta.dirname, "./arkzen/core/adapters")
        },
        // @/arkzen/core → local stack copy (synced from engine/shared)
        {
          find: "@/arkzen/core",
          replacement: path.resolve(import.meta.dirname, "./arkzen/core")
        },
        // @/ → src/ (pages, arkzen/generated, etc.)
        {
          find: "@",
          replacement: path.resolve(import.meta.dirname, "./src")
        }
      ]
    },
    server: {
      port: 3e3,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true
        },
        "/storage": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true
        }
      }
    }
  },
  // TanStack Start SSR — set to false if you want SPA-only mode
  server: {
    preset: "node-server"
  },
  routers: {
    // Client-side router entry
    client: {
      entry: "./src/client.tsx"
    },
    // SSR router entry
    ssr: {
      entry: "./src/server.tsx"
    }
  }
});
export {
  app_config_default as default
};
