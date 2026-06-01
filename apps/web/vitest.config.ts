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
        "entities/time-entry/lib/**/*.ts",
        "features/export-time-report/lib/**/*.ts",
        "features/manage-time-entry/model/date-time-local.ts",
        "shared/lib/validation/**/*.ts",
        "widgets/kanban-board/lib/**/*.ts",
      ],
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
