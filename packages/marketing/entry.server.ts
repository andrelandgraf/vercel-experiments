import React from "react";
import { renderToString } from "react-dom/server";
import Root from "./src/root";

export async function GET(request: Request) {
  const html = "<!doctype html>" + renderToString(<Root />);
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
