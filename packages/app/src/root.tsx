import React from "react";
import { Router } from "framework/runtime";
import { routes } from "./App";

export function Root({ url }: { url?: string | URL }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bun + React</title>
      </head>
      <body>
        <Router routes={routes} url={url} />
        <script type="module" src="./frontend.js"></script>
      </body>
    </html>
  );
}

export default Root;
