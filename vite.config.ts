import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Production builds target https://moyi5603.github.io/humanistic-care/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/humanistic-care/" : "/",
  server: {
    // host: true 在部分 macOS 上会触发 uv_interface_addresses 错误，导致 dev 起不来
    host: "127.0.0.1",
    port: 5174,
    strictPort: false,
    open: true,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
