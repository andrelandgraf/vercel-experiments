import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, test, expect } from "bun:test";
import { Router, Link } from "./router";

beforeEach(() => {
  window.location.href = "http://localhost/";
});

function Home() {
  return <Link to="/about">About</Link>;
}

function About() {
  return <div>About</div>;
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
];

test("router always renders children", () => {
  render(
    <Router routes={routes}>
      <footer>Footer</footer>
    </Router>,
  );
  expect(screen.getByText("Footer")).toBeInTheDocument();
  fireEvent.click(screen.getByText("About"));
  expect(screen.getByText("Footer")).toBeInTheDocument();
});
