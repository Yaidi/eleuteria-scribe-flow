import { screen } from "@testing-library/react";
import { vi, expect, describe, test } from "vitest";
import App from "@/App.tsx";
import { renderWithProviders } from "../utils/renderWithProviders.tsx";
import { templates } from "../mocks/templates.ts";
import { BrowserRouter, HashRouter } from "react-router-dom";

vi.mock("@/https/fetch.ts", () => ({
  getTemplates: vi.fn(() => Promise.resolve(templates)),
}));

describe("App", () => {
  test("Show Projects Page", () => {
    window.history.pushState({}, "", "/");
    renderWithProviders(<App Router={BrowserRouter}></App>);
    expect(window.location.pathname).toBe("/");
    expect(screen.getByTestId("project-loading")).toBeTruthy();
  });

  test("Show Not Found Page when path is invalid", async () => {
    window.history.pushState({}, "", "/invalid-path");
    renderWithProviders(<App Router={BrowserRouter} />);
    expect(window.location.pathname).toBe("/invalid-path");
    expect(screen.findByText(/404/i)).toBeTruthy();
    expect(screen.getByText(/not found/i)).toBeTruthy();
    expect(screen.getByText(/Oops! Page not found/i)).toBeTruthy();
  });

  test("should test hash router redirect to Welcome page", () => {
    window.location.hash = "#/";
    renderWithProviders(<App Router={HashRouter}></App>);
    expect(window.location.hash).toBe("#/");
    expect(screen.getByTestId("project-loading")).toBeTruthy();
  });
});
