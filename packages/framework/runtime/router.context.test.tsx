import { render } from "@testing-library/react";
import React from "react";
import { test, expect } from "bun:test";
import { useNavigate, useRouterState } from "./router";

function UseNavigate() {
  useNavigate();
  return null;
}

test("useNavigate outside Router throws", () => {
  expect(() => render(<UseNavigate />)).toThrow(
    "useNavigate must be used within Router",
  );
});

function UseRouterStateComponent() {
  useRouterState();
  return null;
}

test("useRouterState outside Router throws", () => {
  expect(() => render(<UseRouterStateComponent />)).toThrow(
    "useRouterState must be used within Router",
  );
});
