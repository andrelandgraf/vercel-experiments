import { renderToString } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import App from "./App";

export async function GET() {
  const templatePath = fileURLToPath(
    new URL("../static/index.html", import.meta.url),
  );
  let html = await readFile(templatePath, "utf8");
  const appHtml = renderToString(<App />);
  html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
