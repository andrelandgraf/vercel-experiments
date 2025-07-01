import React from "react";
import { renderToString } from "react-dom/server";
import Root from "./src/root";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const html = "<!doctype html>" + renderToString(<Root url={url} />);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
