import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Router, Link, useRouterState } from "./router";

function Home() {
  return (
    <div>
      Home <Link to="/about">About</Link>
    </div>
  );
}

function About() {
  return <div>About</div>;
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
];

test("navigates between routes", () => {
  render(<Router routes={routes} />);
  expect(screen.getByText("Home")).toBeInTheDocument();
  fireEvent.click(screen.getByText("About"));
  expect(screen.getByText("About")).toBeInTheDocument();
});

function HomeWithParams() {
  return (
    <div>
      Home <Link to="/todos/123?foo=bar">Todo</Link>
    </div>
  );
}

function Todo() {
  const { params, search } = useRouterState();
  return (
    <div>
      Todo {params.id} {search.foo}
    </div>
  );
}

const paramRoutes = [
  { path: "/", component: HomeWithParams },
  { path: "/todos/[id]", component: Todo },
];

test("parses params and query string", () => {
  render(<Router routes={paramRoutes} />);
  fireEvent.click(screen.getByText("Todo"));
  expect(screen.getByText("Todo 123 bar")).toBeInTheDocument();
});
