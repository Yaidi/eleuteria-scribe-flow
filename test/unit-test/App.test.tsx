import { screen } from "@testing-library/react";
import { vi, expect, describe, test, beforeEach } from "vitest";
import App from "@/App.tsx";
import { renderWithProviders } from "../utils/renderWithProviders.tsx";
import { templates } from "../mocks/templates.ts";

vi.mock("@/https/fetch.ts", () => ({
  getTemplates: vi.fn(() => Promise.resolve(templates)),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("App", () => {
  test("Show Welcome Page", () => {
    window.history.pushState({}, "", "/");
    renderWithProviders(<App></App>);
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("heading", { name: /Eleuteria/i })).toBeTruthy();
  });

  test("should test hash router redirect to Welcome page", () => {
    vi.doMock("@/store/electron/actions", async () => {
      const actual = await vi.importActual<typeof import("@/store/electron/actions")>(
        "@/store/electron/actions",
      );
      return {
        ...actual,
        getElectron: () => true,
        electron: true,
      };
    });
    window.location.hash = "#/";
    renderWithProviders(<App></App>);
    expect(window.location.hash).toBe("#/");
    expect(screen.getByRole("heading", { name: /Eleuteria/i })).toBeTruthy();
  });

  test("Show Not Found Page when path is invalid", async () => {
    window.history.pushState({}, "", "/invalid-path");
    renderWithProviders(<App />);
    expect(window.location.pathname).toBe("/invalid-path");
    expect(screen.findByText(/404/i)).toBeTruthy();
    expect(screen.getByText(/not found/i)).toBeTruthy();
    expect(screen.getByText(/Oops! Page not found/i)).toBeTruthy();
  });
});
