import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("app")!;

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= hydrateRoot(container, app));
  root.render(app);
} else {
  hydrateRoot(container, app);
}
