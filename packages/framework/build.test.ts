import { test, expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

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
<html><head></head><body><script type="module" src="./index.ts"></script></body></html>`;
const tsContent = `console.log('hello');`;

test(
  "build creates vercel output and copies public files",
  withTempDir(async (dir) => {
    await mkdir(path.join(dir, "src"));
    await writeFile(path.join(dir, "src/index.html"), htmlContent);
    await writeFile(path.join(dir, "src/index.ts"), tsContent);
    await mkdir(path.join(dir, "public"));
    await writeFile(path.join(dir, "public/test.txt"), "static");

    const { build } = await loadBuild();
    const result = await build();
    expect(result.success).toBe(true);

    const outBase = path.join(dir, ".vercel/output");
    expect(await fileExists(path.join(outBase, "config.json"))).toBe(true);
    expect(
      await fileExists(path.join(outBase, "static/index.html"))
    ).toBe(true);
    expect(await fileExists(path.join(outBase, "static/tailwind.css"))).toBe(
      true,
    );
    expect(await fileExists(path.join(outBase, "static/test.txt"))).toBe(true);
  }),
);

test(
  "warns when public directory is missing",
  withTempDir(async (dir) => {
    await mkdir(path.join(dir, "src"));
    await writeFile(path.join(dir, "src/index.html"), htmlContent);
    await writeFile(path.join(dir, "src/index.ts"), tsContent);

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
    await expect(build()).rejects.toThrow("Entry point not found");
  }),
);
