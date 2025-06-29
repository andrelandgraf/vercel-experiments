import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { readdir, stat } from "node:fs/promises";

// Helper function to recursively list directory structure
async function listDirectoryStructure(
  dirPath: string,
  prefix = "",
  maxDepth = 3,
  currentDepth = 0,
): Promise<void> {
  if (currentDepth >= maxDepth) return;

  try {
    const items = await readdir(dirPath);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemPath = join(dirPath, item);
      const isLast = i === items.length - 1;
      const currentPrefix = prefix + (isLast ? "└── " : "├── ");
      const nextPrefix = prefix + (isLast ? "    " : "│   ");

      try {
        const stats = await stat(itemPath);
        console.log(currentPrefix + item + (stats.isDirectory() ? "/" : ""));

        if (
          stats.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          await listDirectoryStructure(
            itemPath,
            nextPrefix,
            maxDepth,
            currentDepth + 1,
          );
        }
      } catch (error) {
        console.log(currentPrefix + item + " (error reading)");
      }
    }
  } catch (error) {
    console.log(prefix + "Error reading directory:", error);
  }
}

// Helper function to check if a directory exists
async function checkDirectory(
  path: string,
  description: string,
): Promise<void> {
  try {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      console.log(`✅ ${description} exists at: ${path}`);
      console.log(`📂 Contents:`);
      await listDirectoryStructure(path, "", 2);
    } else {
      console.log(`❌ ${description} exists but is not a directory: ${path}`);
    }
  } catch (error) {
    console.log(`❌ ${description} does not exist: ${path}`);
  }
}

console.log("🔍 BUILD ENVIRONMENT DEBUG INFO");
console.log("================================");

// Show current working directory
console.log("📁 Current working directory:", process.cwd());
console.log("📁 __dirname equivalent:", import.meta.dir);

// Check parent directories for existing .vercel or output folders
console.log("\n🔍 CHECKING PARENT DIRECTORIES");
console.log("==============================");

// Check if there's a .vercel folder at the project root (/vercel/path0)
const projectRoot = "/vercel/path0";
console.log(`\n🔍 Checking project root: ${projectRoot}`);
await checkDirectory(projectRoot, "Project root");

console.log(`\n🔍 Checking for .vercel at project root:`);
await checkDirectory(join(projectRoot, ".vercel"), ".vercel at project root");

console.log(`\n🔍 Checking for output at project root:`);
await checkDirectory(join(projectRoot, "output"), "output at project root");

console.log(`\n🔍 Checking for /vercel/output (absolute):`);
await checkDirectory("/vercel/output", "/vercel/output");

console.log(`\n🔍 Checking /vercel directory:`);
await checkDirectory("/vercel", "/vercel directory");

// Show current directory structure
console.log("\n📂 Current directory structure:");
await listDirectoryStructure(".", "", 3);

// Detect if we're running in Vercel's production environment
const isVercelProduction =
  process.env.VERCEL === "1" || process.env.CI === "true";
const isLocalBuild = !isVercelProduction;

console.log("\n🌍 ENVIRONMENT DETECTION");
console.log("========================");
console.log(
  "📍 Environment:",
  isVercelProduction ? "Vercel Production" : "Local Development",
);
console.log("📍 VERCEL env var:", process.env.VERCEL || "not set");
console.log("📍 CI env var:", process.env.CI || "not set");

// Choose output directory based on environment
let outputDir: string;
let vercelDir: string;

if (isVercelProduction) {
  // In Vercel production, use project root's .vercel directory
  outputDir = join("../../.vercel", "output", "static");
  vercelDir = "../../.vercel";
  console.log("🏭 Using PRODUCTION output path");
} else {
  // Locally, use package's own .vercel directory (matches `vercel build` behavior)
  outputDir = join(".vercel", "output", "static");
  vercelDir = ".vercel";
  console.log("🏠 Using LOCAL output path");
}

console.log("\n🎯 Target output directory:", outputDir);
console.log("🎯 Absolute output path:", join(process.cwd(), outputDir));

// Check if .vercel directory exists
try {
  const vercelStats = await stat(vercelDir);
  console.log(`\n✅ .vercel directory already exists at: ${vercelDir}`);
  console.log("📂 Contents:");
  await listDirectoryStructure(vercelDir, "", 2);
} catch (error) {
  console.log(`\n❌ .vercel directory does not exist yet at: ${vercelDir}`);
}

// Ensure the output directory exists
console.log("\n📁 Creating output directory...");
await mkdir(outputDir, { recursive: true });

// Show .vercel structure after creation
console.log("\n📂 .vercel directory structure after creation:");
await listDirectoryStructure(vercelDir, "", 3);

console.log("\n🚀 Starting build...");
const output = await Bun.build({
  entrypoints: [join(".", "src", "index.html")],
  outdir: outputDir,
  sourcemap: "linked",
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("\n✅ Build completed!");
console.log("📊 Build output:", output);

// Show final directory structure
console.log("\n📂 Final .vercel directory structure:");
await listDirectoryStructure(vercelDir, "", 3);

// Check if Vercel created anything at the project root level after our build
console.log("\n🔍 POST-BUILD: Checking if Vercel created output folders:");
console.log("========================================================");

console.log(`\n🔍 Re-checking project root after build:`);
await checkDirectory(projectRoot, "Project root after build");

console.log(`\n🔍 Re-checking /vercel/output after build:`);
await checkDirectory("/vercel/output", "/vercel/output after build");

export {};
