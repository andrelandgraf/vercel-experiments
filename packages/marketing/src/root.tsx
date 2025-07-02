import { App } from "./App";

export function Root({
  clientScriptSrc = "./entry.client.tsx",
  cssHref = "./tailwind.css",
}: {
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
        <App />
        <script type="module" src={clientScriptSrc}></script>
      </body>
    </html>
  );
}

export default Root;
