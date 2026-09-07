import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    // MiraMind runs entirely in the browser: no server functions, no route loaders. The build
    // prerenders one shell (dist/client/_shell.html) and the router takes over from there.
    tanstackStart({ spa: { enabled: true } }),
    react(),
  ],
});
