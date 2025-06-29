await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: ".vercel/output/static",
  sourcemap: "linked",
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

export {};
