import { renderToStaticMarkup } from "react-dom/server";
import { App } from "../src/app";
import { writeFileSync } from "fs";

// Render the App to static HTML (full document)
const html = "<!DOCTYPE html>" + renderToStaticMarkup(<App />);

// Write the result to public/index.html
writeFileSync("./public/index.html", html);
console.log("Static HTML generated at public/index.html");

export {};
