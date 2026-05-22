import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    coverage: {
      exclude: ["**/*.test.ts"],
      include: [
        "entities/kanban/lib/**/*.ts",
        "widgets/kanban-board/lib/**/*.ts",
      ],
      provider: "v8",
      reporter: ["text", "lcov"],
    },
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
