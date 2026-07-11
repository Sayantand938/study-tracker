import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Study Tracker",
        short_name: "StudyTracker",
        description: "Track your study sessions with shifts and history.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        id: "/", // stable App ID
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-timer-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Timer view",
          },
          {
            src: "/screenshot-history-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "History view",
          },
          {
            src: "/screenshot-timer-mobile.png",
            sizes: "750x1334",
            type: "image/png",
            label: "Timer view (mobile)",
          },
          {
            src: "/screenshot-history-mobile.png",
            sizes: "750x1334",
            type: "image/png",
            label: "History view (mobile)",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,ttf}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});