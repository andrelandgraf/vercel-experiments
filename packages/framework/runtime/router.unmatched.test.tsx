import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, test, expect } from "bun:test";
import { Router, useNavigate } from "./router";

beforeEach(() => {
  window.location.href = "http://localhost/";
});

function Home() {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/unknown")}>Go</button>;
}

const routes = [{ path: "/", component: Home }];

test("renders nothing for unknown route", () => {
  render(<Router routes={routes} />);
  fireEvent.click(screen.getByText("Go"));
  expect(document.body.textContent).toBe("");
  expect(window.location.pathname).toBe("/unknown");
});
