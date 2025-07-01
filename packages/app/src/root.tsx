import { Router } from "framework/runtime";
import { routes } from "./App";

export function Root({
  url,
  clientScriptSrc = "./entry.client.tsx",
}: {
  url?: string | URL;
  clientScriptSrc?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bun + React</title>
        <link rel="stylesheet" href="./tailwind.css" />
      </head>
      <body>
        <Router routes={routes} url={url} />
        <script type="module" src={clientScriptSrc}></script>
      </body>
    </html>
  );
}

export default Root;
