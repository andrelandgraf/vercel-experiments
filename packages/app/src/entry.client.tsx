import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { Router } from "framework/runtime";
import { routes } from "./App";

const container = document.getElementById("app")!;

const app = (
  <StrictMode>
    <Router routes={routes} />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= hydrateRoot(container, app));
  root.render(app);
} else {
  hydrateRoot(container, app);
}
