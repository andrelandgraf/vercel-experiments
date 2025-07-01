import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, test, expect } from "bun:test";
import { Router, Link } from "./router";

beforeEach(() => {
  window.location.href = "http://localhost/";
});

function Home() {
  return (
    <div>
      <Link to="/about">About</Link>
      <Link to="/replace" replace>
        Replace
      </Link>
    </div>
  );
}

function About() {
  return (
    <div>
      About{" "}
      <Link to="/replace" replace>
        Replace
      </Link>
    </div>
  );
}

function ReplacePage() {
  return <div>Replace</div>;
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/replace", component: ReplacePage },
];

test("supports browser back navigation", () => {
  render(<Router routes={routes} />);
  fireEvent.click(screen.getByText("About"));
  expect(screen.getByText("About")).toBeInTheDocument();
  window.history.pushState(null, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
  expect(window.location.pathname).toBe("/");
});

test("replace navigation does not add history entry", () => {
  render(<Router routes={routes} />);
  const initialLength = window.history.length;
  fireEvent.click(screen.getByText("About"));
  const afterPush = window.history.length;
  expect(afterPush).toBeGreaterThan(initialLength);
  fireEvent.click(screen.getByText("Replace"));
  expect(window.history.length).toBe(afterPush);
  window.history.pushState(null, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
  expect(window.location.pathname).toBe("/");
});
