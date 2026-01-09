import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  modules: ["@nuxt/ui"],
  css: ['./app/app.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    esbuild: {
      options: {
        target: 'es2020'
      }
    }
  }
});
