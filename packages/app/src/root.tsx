import { Router } from "framework/runtime";
import { routes } from "./App";

export function Root({
  url,
  clientScriptSrc = "./entry.client.tsx",
  cssHref = "./tailwind.css",
}: {
  url?: string | URL;
  clientScriptSrc?: string;
  cssHref?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bun + React</title>
        <link rel="stylesheet" href={cssHref} />
      </head>
      <body>
        <Router routes={routes} url={url} />
        <script type="module" src={clientScriptSrc}></script>
      </body>
    </html>
  );
}

export default Root;
