import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { readdir, stat } from "node:fs/promises";

// Helper function to recursively list directory structure
async function listDirectoryStructure(dirPath: string, prefix = "", maxDepth = 3, currentDepth = 0): Promise<void> {
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
        
        if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          await listDirectoryStructure(itemPath, nextPrefix, maxDepth, currentDepth + 1);
        }
      } catch (error) {
        console.log(currentPrefix + item + " (error reading)");
      }
    }
  } catch (error) {
    console.log(prefix + "Error reading directory:", error);
  }
}

console.log("🔍 BUILD ENVIRONMENT DEBUG INFO");
console.log("================================");

// Show current working directory
console.log("📁 Current working directory:", process.cwd());
console.log("📁 __dirname equivalent:", import.meta.dir);

// Show current directory structure
console.log("\n📂 Current directory structure:");
await listDirectoryStructure(".", "", 3);

const outputDir = join(".vercel", "output", "static");
console.log("\n🎯 Target output directory:", outputDir);
console.log("🎯 Absolute output path:", join(process.cwd(), outputDir));

// Check if .vercel directory exists before creating
try {
  const vercelStats = await stat(".vercel");
  console.log("\n✅ .vercel directory already exists");
  console.log("📂 Contents of .vercel:");
  await listDirectoryStructure(".vercel", "", 2);
} catch (error) {
  console.log("\n❌ .vercel directory does not exist yet");
}

// Ensure the output directory exists
console.log("\n📁 Creating output directory...");
await mkdir(outputDir, { recursive: true });

// Show .vercel structure after creation
console.log("\n📂 .vercel directory structure after creation:");
await listDirectoryStructure(".vercel", "", 3);

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
await listDirectoryStructure(".vercel", "", 3);

export {};
