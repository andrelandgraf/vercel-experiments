import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Root from "./root";

// Read the manifest file to get the hashed client script filename
let manifest: Record<string, string> = {};
try {
  const manifestPath = resolve(process.cwd(), "manifest.json");
  const manifestContent = readFileSync(manifestPath, "utf8");
  manifest = JSON.parse(manifestContent);
} catch (error) {
  console.warn(
    "Warning: Could not read manifest.json, falling back to development mode",
  );
  manifest = { "entry.client.tsx": "./entry.client.tsx" };
}

export async function GET() {
  const clientScriptSrc = manifest["entry.client.tsx"] || "./entry.client.tsx";
  const html =
    "<!doctype html>" +
    renderToString(<Root clientScriptSrc={clientScriptSrc} />);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
