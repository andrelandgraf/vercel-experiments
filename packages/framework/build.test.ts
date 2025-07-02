import { test, expect } from "bun:test";
import {
  mkdtemp,
  mkdir,
  writeFile,
  rm,
  access,
  readFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const uiConfig = path.resolve(__dirname, "../ui/styles/globals.css");

async function loadBuild() {
  return (await import("./build")) as typeof import("./build");
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function withTempDir(fn: (dir: string) => Promise<void>) {
  return async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "fw-build-"));
    const cwd = process.cwd();
    try {
      process.chdir(dir);
      await fn(dir);
    } finally {
      // remove build artifacts if they were created
      await rm(path.join(dir, ".vercel"), { recursive: true, force: true });
      process.chdir(cwd);
      await rm(dir, { recursive: true, force: true });
    }
  };
}

const htmlContent = `<!doctype html>
<html><head><link rel="stylesheet" href="../tailwind.css" /></head><body><script type="module" src="./entry.client.tsx"></script></body></html>`;
const tsContent = `console.log('hello');`;

test(
  "build creates vercel output and copies public files",
  withTempDir(async (dir) => {
    await mkdir(path.join(dir, "src"));
    await writeFile(path.join(dir, "src/index.html"), htmlContent);
    await writeFile(path.join(dir, "src/entry.client.tsx"), tsContent);
    await writeFile(path.join(dir, "src/entry.server.tsx"), tsContent);
    await writeFile(
      path.join(dir, "tailwind.css"),
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
    );
    await writeFile(
      path.join(dir, "tailwind.css"),
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
    );
    await mkdir(path.join(dir, "public"));
    await writeFile(path.join(dir, "public/test.txt"), "static");

    const { build } = await loadBuild();
    const result = await build();
    expect(result.success).toBe(true);

    const outBase = path.join(dir, ".vercel/output");
    const staticDir = path.join(outBase, "static");
    const funcDir = path.join(outBase, "functions", "index.func");
    expect(await fileExists(path.join(outBase, "config.json"))).toBe(true);
    expect(await fileExists(path.join(staticDir, "index.html"))).toBe(false);
    expect(await fileExists(path.join(funcDir, "index.html"))).toBe(true);
    const html = await readFile(path.join(funcDir, "index.html"), "utf8");
    const cssMatch = html.match(/href="(.+\.css)"/);
    const jsMatch = html.match(/src="(.+\.js)"/);
    expect(cssMatch).toBeTruthy();
    expect(jsMatch).toBeTruthy();
    if (cssMatch && jsMatch) {
      const cssFile = cssMatch[1]
        .replace(/^\.\/?/, "")
        .replace(/^\/?static\//, "");
      const jsFile = jsMatch[1]
        .replace(/^\.\/?/, "")
        .replace(/^\/?static\//, "");
      expect(await fileExists(path.join(staticDir, cssFile))).toBe(true);
      expect(await fileExists(path.join(staticDir, jsFile))).toBe(true);
    }
    expect(await fileExists(path.join(staticDir, "test.txt"))).toBe(true);
  }),
);

test(
  "warns when public directory is missing",
  withTempDir(async (dir) => {
    await mkdir(path.join(dir, "src"));
    await writeFile(path.join(dir, "src/index.html"), htmlContent);
    await writeFile(path.join(dir, "src/entry.client.tsx"), tsContent);
    await writeFile(path.join(dir, "src/entry.server.tsx"), tsContent);

    const warnings: string[] = [];
    const origWarn = console.warn;
    console.warn = (msg?: any) => {
      warnings.push(String(msg));
    };
    const { build } = await loadBuild();
    const result = await build();
    console.warn = origWarn;

    expect(result.success).toBe(true);
    expect(warnings.some((m) => m.includes("Public directory not found"))).toBe(
      true,
    );
  }),
);

test(
  "throws when src directory is missing",
  withTempDir(async () => {
    const { build } = await loadBuild();
    await expect(build()).rejects.toThrow("Source directory not found");
  }),
);

test(
  "throws when entry point is missing",
  withTempDir(async (dir) => {
    await mkdir(path.join(dir, "src"));
    const { build } = await loadBuild();
    await expect(build()).rejects.toThrow("HTML entry not found");
  }),
);
