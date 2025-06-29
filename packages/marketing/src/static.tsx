import { Button } from "vercel-experiments-ui/components/button";

export function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bun + React</title>
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body>
        <div className="app">
          <h1 className="text-2xl font-bold">Bun + React</h1>
          <Button>Click me</Button>
        </div>
      </body>
    </html>
  );
}

export default App;
