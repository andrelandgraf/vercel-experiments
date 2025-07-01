import { Router, Link, useRouterState } from "framework/runtime";
import type { Route } from "framework/runtime";

function Nav() {
  return (
    <nav>
      <Link to="/">Home</Link> | <Link to="/about">About</Link> |{" "}
      <Link to="/users/42">User</Link>
    </nav>
  );
}

function Home() {
  return (
    <div className="app">
      <h1>Bun + React</h1>
      <h2>Home</h2>
      <Nav />
    </div>
  );
}

function About() {
  return (
    <div className="app">
      <h1>Bun + React</h1>
      <h2>About</h2>
      <Nav />
    </div>
  );
}

function User() {
  const { params } = useRouterState();
  return (
    <div className="app">
      <h1>Bun + React</h1>
      <h2>User {params.id}</h2>
      <Nav />
    </div>
  );
}

export const routes: Route[] = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/users/[id]", component: User },
];

function RouterLogger() {
  const state = useRouterState();
  console.log("router state", state);
  return null;
}

export function App() {
  return (
    <Router routes={routes}>
      <RouterLogger />
    </Router>
  );
}

export default App;
