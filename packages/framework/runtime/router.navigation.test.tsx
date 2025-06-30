import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, test, expect } from "bun:test";
import { Router, Link, useNavigate } from "./router";

beforeEach(() => {
  window.location.href = "http://localhost/";
});

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      Home <Link to="/about">About</Link>
      <button onClick={() => navigate("/about")}>Go</button>
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

test("programmatic navigation works", () => {
  render(<Router routes={routes} />);
  fireEvent.click(screen.getByText("Go"));
  expect(screen.getByText("About")).toBeInTheDocument();
});
