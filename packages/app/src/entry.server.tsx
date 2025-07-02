import { renderToString } from "react-dom/server";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Router } from "framework/runtime";
import { routes } from "./App";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dir = process.cwd();
  const templatePath = path.join(dir, "index.html");

  console.log("📂 Server cwd", process.cwd());
  console.log("📂 Server dir", dir);
  console.log("📂 Dir contents", await readdir(dir));
  console.log("📄 Template path", templatePath);
  let html = await readFile(templatePath, "utf8");
  const appHtml = renderToString(<Router routes={routes} url={url} />);
  html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
