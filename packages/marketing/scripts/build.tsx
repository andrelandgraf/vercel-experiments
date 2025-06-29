import { renderToStaticMarkup } from "react-dom/server";
import { App } from "../src/static";
import { writeFileSync } from "fs";
const { $ } = Bun;

// Build Tailwind CSS
await $`bunx @tailwindcss/cli -c ./tailwind.config.ts -i ../ui/styles/globals.css -o ./public/tailwind.css --minify`;

// Render the App to static HTML (full document)
const html = "<!DOCTYPE html>" + renderToStaticMarkup(<App />);

// Write the result to public/index.html
writeFileSync("./public/index.html", html);
console.log("Static HTML and Tailwind CSS generated in public/");

export {};
