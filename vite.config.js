import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "todo",
  plugins: [tailwindcss()],
  build: {
    outDir: "../dist",
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "RDDom",
      fileName: (format) => `rd-dom.${format}.js`,
    },
  },
  esbuild: {
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    jsxInject: `import { createElement, Fragment } from '../src/jsx-runtime.js'`,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["../src/index.js", "../src/signal.js", "../src/jsx-runtime.js"],
  },
  server: {
    port: 3000,
    open: true,
  },
});
