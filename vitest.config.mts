/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}"],
    setupFiles: "./vitest.setup.ts",
  },
});
