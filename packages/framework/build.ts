import { $ } from "bun";
import { mkdir, access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function build() {
  const rootDir = process.cwd();
  const publicDir = "public";
  const srcDir = "src";
  const clientEntry = "entry.client.tsx";
  const serverEntry = "entry.server.tsx";
  const outputDir = ".vercel/output";
  const staticOutputDir = path.join(outputDir, "static");

  // Check if required directories exist
  const publicPath = path.resolve(rootDir, publicDir);
  const srcPath = path.resolve(rootDir, srcDir);
  const clientEntryPath = path.resolve(rootDir, srcDir, clientEntry);
  const serverEntryPath = path.resolve(rootDir, srcDir, serverEntry);

  try {
    await access(srcPath);
  } catch {
    throw new Error(
      `❌ Source directory not found: ${srcPath}\nMake sure you have a 'src' folder in your project root.`,
    );
  }

  try {
    await access(clientEntryPath);
  } catch {
    throw new Error(
      `❌ Client entry not found: ${clientEntryPath}\nMake sure you have a 'entry.client.tsx' file in your src folder.`,
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

  // Build the client application first to get the hashed filenames
  console.log(`🔨 Building ${clientEntryPath}...`);

  const clientOutput = await Bun.build({
    entrypoints: [clientEntryPath],
    outdir: staticOutputDir,
    sourcemap: "linked",
    target: "browser",
    minify: true,
    naming: "[dir]/[name]-[hash].[ext]", // Enable hashing for cache busting
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });

  if (!clientOutput.success) {
    throw new Error("Client build failed");
  }

  // Create a manifest mapping entry points to their built filenames
  const manifest: Record<string, string> = {};

  for (const output of clientOutput.outputs) {
    const filename = path.basename(output.path);
    const relativePath = path.relative(staticOutputDir, output.path);

    // Map the original entry name to the built filename (only include .js files, not .js.map)
    if (
      filename.startsWith("entry.client") &&
      filename.endsWith(".js") &&
      !filename.endsWith(".js.map")
    ) {
      manifest["entry.client.tsx"] = `./${relativePath}`;
    }
  }

  // We'll write the manifest after generating CSS so it includes the stylesheet

  // Compile Tailwind CSS only if a project-specific stylesheet exists
  const projectTailwindPath = path.resolve(rootDir, "tailwind.css");
  const hasTailwind = await access(projectTailwindPath)
    .then(() => true)
    .catch(() => false);

  if (hasTailwind) {
    try {
      const css = await readFile(projectTailwindPath, "utf8");
      const result = await compile(css, {
        from: projectTailwindPath,
        loadModule: async (id: string, base: string) => {
          const root = process.cwd();
          const baseDir = path.isAbsolute(base) ? base : root;
          const resolved =
            id.startsWith(".") || id.startsWith("/")
              ? new URL(id, `file://${baseDir}/`).href
              : import.meta.resolve(id);
          const filePath = fileURLToPath(resolved);
          if (filePath.endsWith(".css")) {
            return {
              path: filePath,
              base: path.dirname(filePath),
              module: {},
            };
          }
          return {
            path: filePath,
            base: path.dirname(filePath),
            module: (await import(filePath)).default,
          };
        },
        loadStylesheet: async (id: string, base: string) => {
          const root = process.cwd();
          let resolved: string;
          if (id === "tailwindcss") {
            resolved = import.meta.resolve("tailwindcss/index.css");
          } else if (id === "tw-animate-css") {
            resolved = import.meta.resolve("tw-animate-css");
          } else {
            const baseDir = path.isAbsolute(base) ? base : root;
            resolved = new URL(id, `file://${baseDir}/`).href;
          }
          const filePath = fileURLToPath(resolved);
          return {
            path: filePath,
            base: path.dirname(filePath),
            content: await readFile(filePath, "utf8"),
          };
        },
      });

      const cssContent = result.build([]);
      const hash = Bun.hash(cssContent).toString(36).slice(0, 8);
      const cssFilename = `tailwind-${hash}.css`;
      const cssOutputPath = path.join(staticOutputDir, cssFilename);
      await Bun.write(cssOutputPath, cssContent);
      manifest["tailwind.css"] = `./${cssFilename}`;
      console.log(`✅ Compiled Tailwind CSS to ${cssOutputPath}`);
    } catch (error) {
      console.warn(`⚠️  Failed to compile Tailwind CSS: ${error}`);
    }
  } else {
    console.log("ℹ️  No tailwind.css found - skipping Tailwind compilation");
  }

  // Write the manifest file (now including the CSS) to both static and functions directories
  const manifestContent = JSON.stringify(manifest, null, 2);
  const staticManifestPath = path.join(staticOutputDir, "manifest.json");
  await writeFile(staticManifestPath, manifestContent);
  console.log(`✅ Created client manifest at ${staticManifestPath}`);

  // Build server entry (required)
  const funcDir = path.join(outputDir, "functions", "index.func");
  await mkdir(funcDir, { recursive: true });

  // Copy the manifest to the functions directory so the server can read it
  const serverManifestPath = path.join(funcDir, "manifest.json");
  await writeFile(serverManifestPath, manifestContent);
  console.log(`✅ Created server manifest at ${serverManifestPath}`);

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

  // Create config.json for Vercel Build Output Configuration
  const configPath = path.join(outputDir, "config.json");
  const config = {
    version: 3,
    routes: [{ handle: "filesystem" }, { src: "/(.*)", dest: "/" }],
  };

  await Bun.write(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created config.json at ${configPath}`);

  return clientOutput;
}
