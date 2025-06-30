# Runtime Router Usage

The runtime exports a very small client side router for React applications. It
is intended for demos and testing and only implements a subset of typical router
features.

## Components and Hooks

- `Router` – wraps the application and renders the component that matches the
  current `window.location`.
- `Link` – navigates to a new route on click without reloading the page.
- `useNavigate()` – programmatic navigation helper.
- `useRouterState()` – exposes `{ url, search, params }` derived from the
  current location.

## Defining Routes

Routes are declared as an array of objects with a `path` and React `component`:

```tsx
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/users/[id]', component: User },
];
```

Paths can be static or contain dynamic segments using either `[param]` or
`:param` syntax.

## Usage Example

```tsx
import { Router, Link, useRouterState } from 'framework/runtime';

function Home() {
  return (
    <div>
      <h2>Home</h2>
      <Link to="/about">About</Link>
    </div>
  );
}

function About() {
  const { url } = useRouterState();
  return (
    <div>
      <h2>About</h2>
      <p>Current URL: {url.pathname}</p>
      <Link to="/">Home</Link>
    </div>
  );
}

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

export default function App() {
  return <Router routes={routes} />;
}
```

`Router` listens for `popstate` events so browser navigation works as expected.
When no route matches the current path, nothing is rendered.
