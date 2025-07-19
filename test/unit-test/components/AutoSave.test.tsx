import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AutoSave from "@/components/AutoSave.tsx";

describe("AutoSave component", () => {
  it("should render the auto-save label", () => {
    render(<AutoSave />);
    expect(screen.getByText("Auto-save")).toBeTruthy();
  });

  it("should move the toggle indicator based on state", () => {
    render(<AutoSave />);
    const button = screen.getByRole("button");
    const toggle = screen.getByTestId("toggle-indicator");
    // autoSave = true
    expect(toggle.className).toContain("translate-x-4");

    // autoSave = false
    fireEvent.click(button);
    expect(toggle.className).toContain("translate-x-0.5");
  });
});
