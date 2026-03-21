import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/gorillas-port/" : "./",
  server: {
    port: 3000,
  },
});
