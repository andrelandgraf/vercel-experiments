import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, test, expect } from "bun:test";
import { Router, Link, useRouterState } from "./router";

beforeEach(() => {
  window.location.href = "http://localhost/";
});

function Home() {
  return (
    <div>
      Home <Link to="/todos/123?foo=bar">Todo</Link>{" "}
      <Link to="/users/42">User</Link>{" "}
      <Link to="/todos/%E2%9C%93?foo=bar">Encoded</Link>
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

function User() {
  const { params } = useRouterState();
  return <div>User {params.id}</div>;
}

const routes = [
  { path: "/", component: Home },
  { path: "/todos/[id]", component: Todo },
  { path: "/users/:id", component: User },
];

test("parses params and query string", () => {
  render(<Router routes={routes} />);
  fireEvent.click(screen.getByText("Todo"));
  expect(screen.getByText("Todo 123 bar")).toBeInTheDocument();
});

test("supports colon parameters", () => {
  render(<Router routes={routes} />);
  fireEvent.click(screen.getByText("User"));
  expect(screen.getByText("User 42")).toBeInTheDocument();
});

test("decodes dynamic parameters", () => {
  render(<Router routes={routes} />);
  fireEvent.click(screen.getByText("Encoded"));
  expect(screen.getByText("Todo ✓ bar")).toBeInTheDocument();
});
