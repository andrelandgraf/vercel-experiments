import { $ } from "bun";
import { mkdir, access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiStylesPath = path.resolve(__dirname, "../ui/styles/globals.css");

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

  // Compile Tailwind CSS from the shared UI styles
  try {
    const css = await readFile(uiStylesPath, "utf8");
    const result = await compile(css, {
      from: uiStylesPath,
      loadStylesheet: async (id: string, base: string) => {
        let resolved: string;
        if (id === "tailwindcss") {
          resolved = import.meta.resolve("tailwindcss/index.css");
        } else if (id === "tw-animate-css") {
          resolved = import.meta.resolve("tw-animate-css");
        } else {
          resolved = new URL(id, `file://${base}/`).href;
        }
        const filePath = fileURLToPath(resolved);
        return {
          path: filePath,
          base: path.dirname(filePath),
          content: await readFile(filePath, "utf8"),
        };
      },
    });

    const cssOutputPath = path.join(staticOutputDir, "tailwind.css");
    await Bun.write(cssOutputPath, result.build([]));
    console.log(`✅ Compiled Tailwind CSS to ${cssOutputPath}`);

    const htmlPath = path.join(staticOutputDir, entryPoint);
    let html = await Bun.file(htmlPath).text();
    if (!html.includes("tailwind.css")) {
      html = html.replace(
        /<\/head>/i,
        `  <link rel="stylesheet" href="./tailwind.css" />\n</head>`,
      );
      await Bun.write(htmlPath, html);
      console.log(`✅ Injected Tailwind into ${htmlPath}`);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to compile Tailwind CSS: ${error}`);
  }

  return output;
}
