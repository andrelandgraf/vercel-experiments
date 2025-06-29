import { mkdir } from "node:fs/promises";

const outputDir = ".vercel/output/static";

// Ensure the output directory exists
await mkdir(outputDir, { recursive: true });

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

console.log(output);

export {};
