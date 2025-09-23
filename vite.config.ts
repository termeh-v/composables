import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            name: "composables",
            entry: resolve(__dirname, "src", "index.ts"),
            fileName: (format) => `composables.${format}.js`,
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: [...Object.keys(pkg.peerDependencies || {})],
        },
    },
    plugins: [
        vue(),
        dts({
            insertTypesEntry: true,
            copyDtsFiles: true,
        }),
    ],
});
