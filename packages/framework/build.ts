import { $ } from "bun";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";

export async function build() {
  const rootDir = process.cwd();
  const publicDir = "public";
  const srcDir = "src";
  const entryPoint = "index.html";
  const outputDir = ".vercel/output";
  const staticOutputDir = path.join(outputDir, "static");

  // Check if required directories exist
  const publicPath = path.resolve(rootDir, publicDir);
  const srcPath = path.resolve(rootDir, srcDir);
  const entryPointPath = path.resolve(rootDir, srcDir, entryPoint);

  try {
    await access(srcPath);
  } catch {
    throw new Error(
      `❌ Source directory not found: ${srcPath}\nMake sure you have a 'src' folder in your project root.`,
    );
  }

  try {
    await access(entryPointPath);
  } catch {
    throw new Error(
      `❌ Entry point not found: ${entryPointPath}\nMake sure you have an 'index.html' file in your src folder.`,
    );
  }

  // Check if public directory exists (it's optional, so just warn)
  let hasPublicDir = true;
  try {
    await access(publicPath);
  } catch {
    hasPublicDir = false;
    console.warn(
      `⚠️  Public directory not found: ${publicPath}\nSkipping static file copy. Create a 'public' folder if you have static assets.`,
    );
  }

  // Create output directories
  await mkdir(staticOutputDir, { recursive: true });
  console.log(`✅ Created output directory: ${staticOutputDir}`);

  // Create config.json for Vercel Build Output Configuration
  const configPath = path.join(outputDir, "config.json");
  const config = {
    version: 3,
  };

  await Bun.write(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created config.json at ${configPath}`);

  // Copy static files from public/ to output directory (if public dir exists)
  if (hasPublicDir) {
    try {
      await $`cp -r ${publicPath}/* ${staticOutputDir}/`;
      console.log(
        `✅ Copied static files from ${publicDir}/ to ${staticOutputDir}`,
      );
    } catch (error) {
      console.warn(`⚠️  Failed to copy files from ${publicDir}/: ${error}`);
    }
  }

  // Build the application
  console.log(`🔨 Building ${entryPointPath}...`);

  const output = await Bun.build({
    entrypoints: [entryPointPath],
    outdir: staticOutputDir,
    sourcemap: "linked",
    target: "browser",
    minify: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });

  if (!output.success) {
    console.error("❌ Build failed:", output);
    throw new Error(
      "Build process failed. Check the errors above for details.",
    );
  } else {
    console.log("✅ Build successful!");
    console.log(`📦 Output generated in: ${staticOutputDir}`);
  }

  return output;
}
