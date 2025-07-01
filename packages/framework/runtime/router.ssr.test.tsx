import { test, expect } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "./router";

function Home() {
  return <div>Home</div>;
}

function About() {
  return <div>About</div>;
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
];

test("renders correct route on the server", () => {
  const originalWindow = (globalThis as any).window;
  (globalThis as any).window = undefined;
  const html = renderToString(
    <Router routes={routes} url="http://example.com/about" />,
  );
  (globalThis as any).window = originalWindow;
  expect(html).toContain("About");
});
