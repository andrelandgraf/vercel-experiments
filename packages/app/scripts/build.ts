const { $ } = Bun;

await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  sourcemap: "linked",
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

// Move all files from dist to public (overwriting existing)
await $`mv -f ./dist/* ./public/`;

await $`rm -rf ./dist`;

export {};
