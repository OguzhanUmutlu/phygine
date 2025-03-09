import {defineConfig} from "vite";
import path from "path";

export default defineConfig({
    base: "./",
    server: {
        host: "127.0.0.1",
        port: 1923
    },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, "index.html")
        }
    },
    worker: {
        format: "es"
    }
});