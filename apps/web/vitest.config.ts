import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest-cleanup-each.ts"],
    env: {
      // Suppress Prisma logs during tests
      PRISMA_LOG_LEVEL: "warn",
      DEBUG: "",
      NODE_ENV: "test",
      VITEST: "true",
      // Additional Prisma-specific environment variables
      PRISMA_CLIENT_ENGINE_TYPE: "library",
      PRISMA_CLI_QUERY_ENGINE_TYPE: "library",
    },
    // Global test configuration
    globalSetup: "./vitest-global-setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "app/**/*.ts",
        "app/**/*.tsx",
        "actions/**/*.ts",
        "hooks/**/*.ts",
        "components/**/*.ts",
        "components/**/*.tsx",
        "lib/**/*.ts",
      ],
      exclude: [
        "node_modules",
        "dist",
        "build",
        "public",
        "public/**/*",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
  },
});
