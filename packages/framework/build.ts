import { $ } from "bun";
import { mkdir, access, writeFile, rm } from "node:fs/promises";
import path from "node:path";

export async function build() {
  const rootDir = process.cwd();
  const publicDir = "public";
  const srcDir = "src";
  const htmlEntry = "index.html";
  const serverEntry = "entry.server.tsx";
  const outputDir = ".vercel/output";
  const staticOutputDir = path.join(outputDir, "static");

  // Check if required directories exist
  const publicPath = path.resolve(rootDir, publicDir);
  const srcPath = path.resolve(rootDir, srcDir);
  const htmlEntryPath = path.resolve(rootDir, srcDir, htmlEntry);
  const serverEntryPath = path.resolve(rootDir, srcDir, serverEntry);

  try {
    await access(srcPath);
  } catch {
    throw new Error(
      `❌ Source directory not found: ${srcPath}\nMake sure you have a 'src' folder in your project root.`,
    );
  }

  try {
    await access(htmlEntryPath);
  } catch {
    throw new Error(
      `❌ HTML entry not found: ${htmlEntryPath}\nMake sure you have an 'index.html' file in your src folder.`,
    );
  }

  try {
    await access(serverEntryPath);
  } catch {
    throw new Error(
      `❌ Server entry not found: ${serverEntryPath}\nMake sure you have a 'entry.server.tsx' file in your project root.`,
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

  // Build the HTML entry which bundles the client application and styles
  console.log(`🔨 Building ${htmlEntryPath}...`);

  // Ensure Tailwind stylesheet exists to avoid build errors
  const tailwindPath = path.resolve(rootDir, "tailwind.css");
  let cleanupTailwind = false;
  try {
    await access(tailwindPath);
  } catch {
    await writeFile(tailwindPath, "");
    cleanupTailwind = true;
  }

  const htmlOutput = await Bun.build({
    entrypoints: [htmlEntryPath],
    outdir: staticOutputDir,
    sourcemap: "linked",
    target: "browser",
    minify: true,
    publicPath: "/static/",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });

  if (!htmlOutput.success) {
    throw new Error("Client build failed");
  }

  if (cleanupTailwind) {
    await rm(tailwindPath);
  }

  // Build server entry (required)
  const funcDir = path.join(outputDir, "functions", "index.func");
  await mkdir(funcDir, { recursive: true });

  const serverOutput = await Bun.build({
    entrypoints: [serverEntryPath],
    outdir: funcDir,
    target: "node",
    format: "cjs",
    minify: true,
  });
  if (!serverOutput.success) {
    throw new Error("SSR server build failed");
  }
  if (!serverOutput.outputs.length) {
    throw new Error("SSR server build failed - no outputs");
  }
  const handler = path.basename(serverOutput.outputs[0]!.path);
  const serverConfig = {
    runtime: "nodejs22.x",
    handler,
    launcherType: "Nodejs",
  };
  await Bun.write(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify(serverConfig, null, 2),
  );
  console.log(`✅ Built SSR function to ${funcDir}`);

  // Move the built HTML template next to the server function
  try {
    await $`mv ${path.join(staticOutputDir, "index.html")} ${path.join(funcDir, "index.html")}`;
  } catch (error) {
    console.warn(`⚠️  Failed to move index.html: ${error}`);
  }

  // Create config.json for Vercel Build Output Configuration
  const configPath = path.join(outputDir, "config.json");
  const config = {
    version: 3,
    routes: [{ handle: "filesystem" }, { src: "/(.*)", dest: "/" }],
  };

  await Bun.write(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created config.json at ${configPath}`);

  return htmlOutput;
}
