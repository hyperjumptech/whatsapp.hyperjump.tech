import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": new URL("./src/__mocks__/server-only.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    globals: true,
    environment: "node",
    exclude: ["node_modules", "dist"],
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
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
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
