import { renderToString } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Router } from "framework/runtime";
import { routes } from "./App";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const templatePath = resolve(__dirname, "../static/index.html");
  let html = await readFile(templatePath, "utf8");
  const appHtml = renderToString(<Router routes={routes} url={url} />);
  html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
