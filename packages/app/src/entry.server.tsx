import { renderToString } from "react-dom/server";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Router } from "framework/runtime";
import { routes } from "./App";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cwd = process.cwd();
  const templatePath = path.join(cwd, "index.html");
  console.log("📂 Server cwd", cwd);
  console.log("📂 Dir contents", await readdir(cwd));
  console.log("📄 Template path", templatePath);

  let html = await readFile(templatePath, "utf8");
  const appHtml = renderToString(<Router routes={routes} url={url} />);
  html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
