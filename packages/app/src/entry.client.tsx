import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import Root from "./root";

const app = (
  <StrictMode>
    <Root />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= hydrateRoot(document, app));
  root.render(app);
} else {
  hydrateRoot(document, app);
}
