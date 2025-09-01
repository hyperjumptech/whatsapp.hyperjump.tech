export default async function globalSetup() {
  // Suppress all Prisma logging during tests
  process.env.PRISMA_LOG_LEVEL = "warn";
  process.env.DEBUG = "";
  process.env.VITEST = "true";

  // Suppress console output for Prisma connection messages
  const originalConsoleInfo = console.info;
  const originalConsoleLog = console.log;

  console.info = (...args: any[]) => {
    // Filter out Prisma connection pool messages
    if (typeof args[0] === "string" && args[0].includes("prisma:info")) {
      return;
    }
    if (
      typeof args[0] === "string" &&
      args[0].includes("Starting a postgresql pool")
    ) {
      return;
    }
    originalConsoleInfo(...args);
  };

  console.log = (...args: any[]) => {
    // Filter out Prisma connection pool messages
    if (typeof args[0] === "string" && args[0].includes("prisma:info")) {
      return;
    }
    if (
      typeof args[0] === "string" &&
      args[0].includes("Starting a postgresql pool")
    ) {
      return;
    }
    originalConsoleLog(...args);
  };
}
