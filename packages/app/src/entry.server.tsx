import { renderToString } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Router } from "framework/runtime";
import { routes } from "./App";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const templatePath = fileURLToPath(new URL("./index.html", import.meta.url));
  let html = await readFile(templatePath, "utf8");
  const appHtml = renderToString(<Router routes={routes} url={url} />);
  html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
