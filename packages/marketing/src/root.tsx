import React from "react";
import { App } from "./App";

export function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bun + React</title>
      </head>
      <body>
        <App />
        <script type="module" src="./frontend.js"></script>
      </body>
    </html>
  );
}

export default Root;
