import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/book.ts"),
      name: "TXTBook",
      // the proper extensions will be added
      fileName: "book",
    },
  },
});
