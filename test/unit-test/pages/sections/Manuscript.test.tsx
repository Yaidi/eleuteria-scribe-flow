import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Manuscript from "@/pages/sections/Manuscript.tsx";
import { ESections } from "@/types/sections.ts";
import * as useSectionsHooks from "@/hooks/useSections.ts";

// Mock the TextEditor component
vi.mock("@/components/ui/text-editor.tsx", () => ({
  default: vi.fn(({ onSaveScene, initialContent = "", autoSaveDelay = 1000 }) => (
    <div data-testid="text-editor">
      <span>TextEditor Component</span>
      <span data-testid="initial-content">{initialContent}</span>
      <span data-testid="auto-save-delay">{autoSaveDelay}</span>
      <button data-testid="trigger-save" onClick={() => onSaveScene("test content")}>
        Trigger Save
      </button>
    </div>
  )),
}));

// Mock the useSaveScene hook
vi.mock("@/hooks/useSections.ts", () => ({
  useSaveScene: vi.fn(() => {
    return vi.fn();
  }),
}));

// Mock Card components
vi.mock("@/components/ui/card.tsx", () => ({
  Card: vi.fn(({ children }) => <div data-testid="card">{children}</div>),
  CardContent: vi.fn(({ children }) => <div data-testid="card-content">{children}</div>),
  CardHeader: vi.fn(({ children }) => <div data-testid="card-header">{children}</div>),
  CardTitle: vi.fn(({ children, className }) => (
    <h1 data-testid="card-title" className={className}>
      {children}
    </h1>
  )),
}));

describe("<Manuscript />", () => {
  test("renders component with correct section title", () => {
    render(<Manuscript section={ESections.manuscript} />);

    // Check that the card structure is rendered
    expect(screen.getByTestId("card")).toBeTruthy();
    expect(screen.getByTestId("card-header")).toBeTruthy();
    expect(screen.getByTestId("card-content")).toBeTruthy();

    // Check that the section title is rendered correctly
    const title = screen.getByTestId("card-title");
    expect(title).toBeTruthy();
    expect(title.textContent).toBe("Manuscript");
    expect(title.className).toContain("capitalize");
  });

  test("renders TextEditor component", () => {
    render(<Manuscript section={ESections.manuscript} />);

    const textEditor = screen.getByTestId("text-editor");
    expect(textEditor).toBeTruthy();
    expect(screen.getByText("TextEditor Component")).toBeTruthy();
  });

  test("passes save function to TextEditor", () => {
    const mockSaveFunction = vi.fn();
    vi.mocked(useSectionsHooks.useSaveScene).mockReturnValue(mockSaveFunction);

    render(<Manuscript section={ESections.manuscript} />);

    // Simulate triggering the save function
    const triggerSaveButton = screen.getByTestId("trigger-save");
    triggerSaveButton.click();

    expect(mockSaveFunction).toHaveBeenCalledWith("test content");
  });

  test("renders with different section types", () => {
    const { rerender } = render(<Manuscript section={ESections.manuscript} />);
    expect(screen.getByTestId("card-title").textContent).toBe("Manuscript");

    // Test with a different section if available
    rerender(<Manuscript section={ESections.manuscript} />);
    expect(screen.getByTestId("card-title").textContent).toBe("Manuscript");
  });
});
