import { $ } from "bun";
import { mkdir } from "node:fs/promises";

const outputDir = ".vercel/output/static";

await mkdir(outputDir, { recursive: true });

// Create config.json for Vercel Build Output Configuration
const configPath = ".vercel/output/config.json";
const config = {
  version: 3
};

await Bun.write(configPath, JSON.stringify(config, null, 2));
console.log(`Created config.json at ${configPath}`);

// Copy static files from public/ to output directory
await $`cp -r public/* ${outputDir}/`;
console.log(`Copied static files from public/ to ${outputDir}`);

const output = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: outputDir,
  sourcemap: "linked",
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

if(!output.success) {
  console.error(output);
  throw new Error("Build failed");
} else {
  console.log(output);

}

export {};