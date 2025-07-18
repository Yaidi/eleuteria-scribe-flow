import { screen } from "@testing-library/react";
import { vi, expect, describe, test } from "vitest";
import App from "@/App.tsx";
import { renderWithProviders } from "../utils/renderWithProviders.tsx";
import { templates } from "../mocks/templates.ts";

vi.mock("@/store/electron/actions.ts", () => ({
  electron: false,
}));
vi.mock("@/https/fetch.ts", () => ({
  getTemplates: vi.fn(() => Promise.resolve(templates)),
}));

describe("App", () => {
  test("Show Welcome Page", () => {
    window.history.pushState({}, "", "/");
    renderWithProviders(<App></App>);
    expect(screen.getByRole("heading", { name: /Eleuteria/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Choose Template/i })).toBeTruthy();
  });

  test("Show Error Component when path is invalid", () => {
    window.history.pushState({}, "", "/invalid-path");

    renderWithProviders(<App />);
    expect(screen.getByText(/404/i)).toBeTruthy();
    expect(screen.getByText(/not found/i)).toBeTruthy();
    expect(screen.getByText(/Oops! Page not found/i)).toBeTruthy();
  });

  test("should test hash router", () => {
    vi.mock("@/store/electron/actions.ts", () => ({
      electron: true,
    }));
    window.history.pushState({}, "", "/");
    renderWithProviders(<App></App>);
    expect(screen.getByRole("heading", { name: /Eleuteria/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Choose Template/i })).toBeTruthy();
  });
});
