import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Router, Link } from "./router";

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
