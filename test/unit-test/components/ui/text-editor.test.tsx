import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TextEditor from "@/components/ui/text-editor";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Mock the EditorProvider component
vi.mock("@tiptap/react", () => ({
  EditorProvider: vi.fn(({ children, slotBefore, ...props }) => (
    <div data-testid="editor-provider" {...props}>
      {slotBefore}
      {children}
    </div>
  )),
}));

// Mock the TextEditorMenuBar component
vi.mock("@/components/ui/text-editor-menu-bar.tsx", () => ({
  default: vi.fn(() => <div data-testid="text-editor-menu-bar">Menu Bar</div>),
}));

// Mock StarterKit
vi.mock("@tiptap/starter-kit", () => ({
  default: "StarterKit",
}));

describe("TextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the text editor container with correct structure", () => {
      render(<TextEditor />);

      // Check if the main container exists with correct classes
      const container = screen.getByTestId("editor-provider").parentElement;
      expect(container).toBeDefined();
      expect(container?.className).toContain("border");
      expect(container?.className).toContain("border-gray-300");
      expect(container?.className).toContain("dark:border-slate-600");
      expect(container?.className).toContain("rounded-lg");
      expect(container?.className).toContain("overflow-hidden");
    });

    it("renders the EditorProvider with correct props", () => {
      render(<TextEditor />);

      const editorProvider = screen.getByTestId("editor-provider");
      expect(editorProvider).toBeDefined();
      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          extensions: [StarterKit],
          content: "",
          editorProps: {
            attributes: {
              class:
                "prose prose-sm dark:prose-invert m-0 p-4 focus:outline-none h-[500px] max-w-none overflow-y-auto bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100",
            },
          },
        }),
        expect.any(Object),
      );
    });

    it("renders the TextEditorMenuBar as slotBefore", () => {
      render(<TextEditor />);

      const menuBar = screen.getByTestId("text-editor-menu-bar");
      expect(menuBar).toBeDefined();
      expect(menuBar.textContent).toBe("Menu Bar");
    });
  });

  describe("Configuration", () => {
    it("uses StarterKit extension", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          extensions: [StarterKit],
        }),
        expect.any(Object),
      );
    });

    it("initializes with empty content", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "",
        }),
        expect.any(Object),
      );
    });

    it("applies correct editor attributes for styling", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: {
            attributes: {
              class: expect.stringContaining("prose prose-sm dark:prose-invert"),
            },
          },
        }),
        expect.any(Object),
      );
    });

    it("sets editor height to 500px", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: {
            attributes: {
              class: expect.stringContaining("h-[500px]"),
            },
          },
        }),
        expect.any(Object),
      );
    });
  });

  describe("Component Integration", () => {
    it("maintains component structure consistency", () => {
      const { container } = render(<TextEditor />);

      // Check if the structure is maintained: Container -> EditorProvider -> MenuBar
      const editorContainer = container.firstChild;
      expect(editorContainer).toBeDefined();

      const editorProvider = screen.getByTestId("editor-provider");
      expect(editorProvider).toBeDefined();

      const menuBar = screen.getByTestId("text-editor-menu-bar");
      expect(menuBar).toBeDefined();
    });
  });

  describe("CSS Classes", () => {
    it("applies correct container styling classes", () => {
      const { container } = render(<TextEditor />);

      const editorContainer = container.firstChild as HTMLElement;
      expect(editorContainer.className).toContain(
        "border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden",
      );
    });

    it("applies correct editor prose classes", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: {
            attributes: {
              class: expect.stringContaining("prose prose-sm dark:prose-invert"),
            },
          },
        }),
        expect.any(Object),
      );
    });

    it("applies correct spacing and layout classes", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: {
            attributes: {
              class: expect.stringContaining("m-0 p-4"),
            },
          },
        }),
        expect.any(Object),
      );
    });

    it("applies correct focus and overflow classes", () => {
      render(<TextEditor />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: {
            attributes: {
              class: expect.stringContaining("focus:outline-none"),
            },
          },
        }),
        expect.any(Object),
      );

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          editorProps: {
            attributes: {
              class: expect.stringContaining("overflow-y-auto"),
            },
          },
        }),
        expect.any(Object),
      );
    });
  });
});
