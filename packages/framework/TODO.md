# TODO: Refactor build.ts

- [ ] Split `build()` into smaller functions:
  - `ensureRequiredFiles()` to check directories and entries
  - `copyStaticAssets()` to handle `public/` copying
  - `bundleClient()` for client bundling
  - `compileTailwind()` for Tailwind CSS
  - `bundleServer()` for server bundling
- [ ] Export these helpers from `build.ts` and use them in `build()`
- [ ] Add unit tests for each helper
- [ ] Keep end-to-end tests for the overall `build()` process
- [ ] Snapshot `manifest.json` and `config.json` outputs
