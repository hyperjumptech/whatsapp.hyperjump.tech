#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");

console.log("🔍 Collecting coverage reports from all workspaces...");

// Dynamically find workspaces with coverage files
function findWorkspacesWithCoverage() {
  // Read workspace configuration from pnpm-workspace.yaml
  const workspaceConfigPath = path.join(process.cwd(), "pnpm-workspace.yaml");
  let workspacePatterns = [];

  if (fs.existsSync(workspaceConfigPath)) {
    try {
      const workspaceConfig = yaml.load(
        fs.readFileSync(workspaceConfigPath, "utf8")
      );
      workspacePatterns = workspaceConfig.packages || [];
    } catch (error) {
      console.warn("⚠️ Could not parse pnpm-workspace.yaml:", error.message);
      // Fallback to common patterns if parsing fails
      workspacePatterns = ["apps/*", "packages/*"];
    }
  } else {
    // Fallback to common patterns if file doesn't exist
    workspacePatterns = ["apps/*", "packages/*"];
  }

  // Find all potential workspace directories
  const workspaces = [];
  workspacePatterns.forEach((pattern) => {
    // Handle glob patterns like "apps/*"
    const baseDir = pattern.split("/*")[0];
    if (fs.existsSync(baseDir)) {
      const entries = fs.readdirSync(baseDir, { withFileTypes: true });
      entries.forEach((entry) => {
        if (entry.isDirectory()) {
          const workspacePath = path.join(baseDir, entry.name);
          // Check if this workspace has a coverage directory with coverage-final.json
          const coverageFile = path.join(
            workspacePath,
            "coverage",
            "coverage-final.json"
          );
          if (fs.existsSync(coverageFile)) {
            workspaces.push(path.join(baseDir, entry.name));
          }
        }
      });
    }
  });

  return workspaces;
}

const workspaces = findWorkspacesWithCoverage();
console.log(
  `Found ${workspaces.length} workspaces with coverage files:`,
  workspaces
);

// Create coverage directory
const coverageDir = path.join(process.cwd(), ".coverage");
const mergedDir = path.join(coverageDir, "merged");
const tmpDir = path.join(mergedDir, "tmp");

if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

if (!fs.existsSync(mergedDir)) {
  fs.mkdirSync(mergedDir, { recursive: true });
}

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Collect all coverage files
const coverageFiles = [];

workspaces.forEach((workspace) => {
  const workspaceCoverageDir = path.join(process.cwd(), workspace, "coverage");
  const coverageFile = path.join(workspaceCoverageDir, "coverage-final.json");

  if (fs.existsSync(coverageFile)) {
    console.log(`✅ Found coverage file: ${workspace}`);
    coverageFiles.push(coverageFile);
  } else {
    console.log(`⚠️  Coverage file not found: ${workspace}`);
  }
});

if (coverageFiles.length === 0) {
  console.error(
    "❌ No coverage files found. Make sure to run tests with coverage first."
  );
  process.exit(1);
}

// Copy all coverage files to the tmp directory for merging
console.log("\n📋 Copying coverage files for merging...");
coverageFiles.forEach((file, index) => {
  const destFile = path.join(tmpDir, `coverage-${index}.json`);
  fs.copyFileSync(file, destFile);
  console.log(`  Copied: ${path.basename(file)} → tmp/coverage-${index}.json`);
});

// Merge all coverage files into one
console.log("\n🔗 Merging coverage reports...");

try {
  // Read all coverage files
  const coverageData = {};

  // Read each coverage file and merge them
  fs.readdirSync(tmpDir).forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(tmpDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);

      // Merge the data into coverageData
      Object.assign(coverageData, data);
    }
  });

  // Write the merged data to the final coverage file
  const finalCoverageFile = path.join(mergedDir, "coverage-final.json");
  fs.writeFileSync(finalCoverageFile, JSON.stringify(coverageData, null, 2));

  // Generate reports using nyc/istanbul
  // First, copy the coverage-final.json to the tmp directory with the expected name format
  fs.copyFileSync(finalCoverageFile, path.join(tmpDir, "coverage-final.json"));

  // Generate reports using nyc
  const reportTypes = ["html", "text", "lcov"];
  const reportCmd = `npx nyc report --reporter=${reportTypes.join(" --reporter=")} --temp-directory=${tmpDir} --report-dir=${path.join(mergedDir, "lcov-report")}`;

  execSync(reportCmd, {
    stdio: "inherit",
  });

  console.log("\n✅ Combined coverage report generated successfully!");
  console.log(`📊 Reports available in: ${mergedDir}`);
  console.log(
    `🌐 HTML Report: file://${path.join(mergedDir, "lcov-report", "index.html")}`
  );
  console.log(`📄 LCOV Report: ${path.join(mergedDir, "lcov.info")}`);
} catch (error) {
  console.error("❌ Failed to merge coverage reports:", error.message);
  process.exit(1);
}
