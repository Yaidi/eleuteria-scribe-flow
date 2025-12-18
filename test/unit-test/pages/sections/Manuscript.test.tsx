import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import Manuscript from "@/pages/sections/Manuscript.tsx";
import * as useSectionsHooks from "@/hooks/useSections.ts";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";

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
  useManuscript: vi.fn(() => ({
    currentChapter: { title: "Title Chapter" },
    currentScene: null,
  })),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders component with correct section title", () => {
    renderWithProviders(<Manuscript />);
    vi.mocked(useSectionsHooks.useManuscript).mockReturnValue({
      currentChapter: {
        title: "Title Chapter",
        id: "",
        description: "",
        scenes: [],
      },
      currentScene: undefined,
      chapters: [],
      isSaving: false,
      lastSavedDate: undefined,
      error: undefined,
    });

    // Check that the card structure is rendered
    expect(screen.getByTestId("card")).toBeTruthy();
    expect(screen.getByTestId("card-header")).toBeTruthy();
    expect(screen.getByTestId("card-content")).toBeTruthy();

    // Check that the section title is rendered correctly
    const title = screen.getByTestId("card-title");
    expect(title).toBeTruthy();
    expect(title.textContent).toBe("Title Chapter");
    expect(title.className).toContain("capitalize");
  });

  test("renders TextEditor component", () => {
    renderWithProviders(<Manuscript />);

    const textEditor = screen.getByTestId("text-editor");
    expect(textEditor).toBeTruthy();
    expect(screen.getByText("TextEditor Component")).toBeTruthy();
  });

  test("passes save function to TextEditor", () => {
    const mockSaveFunction = vi.fn();
    vi.mocked(useSectionsHooks.useSaveScene).mockReturnValue(mockSaveFunction);

    renderWithProviders(<Manuscript />);

    // Simulate triggering the save function
    const triggerSaveButton = screen.getByTestId("trigger-save");
    triggerSaveButton.click();

    expect(mockSaveFunction).toHaveBeenCalledWith("test content");
  });

  test("renders title scene", () => {
    vi.mocked(useSectionsHooks.useManuscript).mockReturnValue({
      chapters: [],
      error: undefined,
      isSaving: false,
      lastSavedDate: undefined,
      currentChapter: undefined,
      currentScene: {
        title: "Title Scene",
        id: "",
        content: "",
        wordCount: 0,
        wordGoal: 0,
        characters: [],
      },
    });

    expect(screen.getByTestId("card-title").textContent).toBe("Title Scene");
  });
});
