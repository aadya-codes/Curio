import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                rabbitHoles: resolve(__dirname, "pages/rabbit-holes.html"),
                puzzles: resolve(__dirname, "pages/puzzles.html"),
                nature: resolve(__dirname, "pages/nature.html"),
                psychology: resolve(__dirname, "pages/psychology.html"),
                history: resolve(__dirname, "pages/history.html"),
                suggest: resolve(__dirname, "pages/suggest.html")
            }
        }
    }
});