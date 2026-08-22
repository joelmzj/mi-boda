import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';
import sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  base: "/mi-boda/", // <- Requerido para repositorios que no son la raíz del usuario
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  preview: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: "https://joelmzj.github.io/mi-boda", // URL temporal para la prueba
    }),
  ],
});