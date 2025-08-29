import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TextEditor from "@/components/ui/text-editor";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Mock fetch globally
global.fetch = vi.fn();

// Mock the EditorProvider component
vi.mock("@tiptap/react", () => ({
  EditorProvider: vi.fn(({ children, slotBefore, onUpdate, ...props }) => (
    <div data-testid="editor-provider" {...props}>
      {slotBefore}
      {children}
      <button
        data-testid="mock-editor-update"
        onClick={() =>
          onUpdate?.({
            editor: {
              getHTML: () => "<p>Updated content</p>",
            },
          })
        }
      >
        Trigger Update
      </button>
    </div>
  )),
  useCurrentEditor: vi.fn(() => ({
    editor: {
      getHTML: () => "<p>Current content</p>",
    },
  })),
}));

// Mock the TextEditorMenuBar component
vi.mock("@/components/ui/text-editor-menu-bar.tsx", () => ({
  default: vi.fn(() => <div data-testid="text-editor-menu-bar">Menu Bar</div>),
}));

// Mock StarterKit
vi.mock("@tiptap/starter-kit", () => ({
  default: "StarterKit",
}));

// Mock CharacterCount extension
vi.mock("@tiptap/extensions", () => ({
  CharacterCount: {
    configure: vi.fn(() => "CharacterCount"),
  },
}));

// Mock Button component
vi.mock("@/components/ui/button.tsx", () => ({
  Button: vi.fn(({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} data-testid="mock-button" {...props}>
      {children}
    </button>
  )),
}));

describe("TextEditor", () => {
  const defaultProps = {
    project_id: 1,
    filename: "test-document.md",
    relativePath: "test-folder",
    initialContent: "<p>Initial content</p>",
    autoSaveDelay: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ session_id: "mock-session-id" }),
    } as Response);
  });

  describe("Rendering", () => {
    it("renders with required props", () => {
      render(<TextEditor {...defaultProps} />);

      const editorProvider = screen.getByTestId("editor-provider");
      expect(editorProvider).toBeDefined();
      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "<p>Initial content</p>",
          extensions: expect.arrayContaining([StarterKit]),
        }),
        expect.any(Object),
      );
    });

    it("renders with default props when minimal props provided", () => {
      const minimalProps = { project_id: 1 };
      render(<TextEditor {...minimalProps} />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "",
          extensions: expect.arrayContaining([StarterKit]),
        }),
        expect.any(Object),
      );
    });

    it("renders save status component", () => {
      render(<TextEditor {...defaultProps} />);

      // Should show initial "Sin guardar" status
      expect(screen.getByText("Sin guardar")).toBeDefined();
    });

    it("renders manual save button", () => {
      render(<TextEditor {...defaultProps} />);

      const saveButton = screen.getByText("Guardar");
      expect(saveButton).toBeDefined();
    });
  });

  describe("Configuration", () => {
    it("uses StarterKit extension", () => {
      render(<TextEditor {...defaultProps} />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          extensions: expect.arrayContaining([StarterKit]),
        }),
        expect.any(Object),
      );
    });

    it("initializes with empty content", () => {
      render(<TextEditor {...defaultProps} />);

      expect(vi.mocked(EditorProvider)).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "<p>Initial content</p>",
        }),
        expect.any(Object),
      );
    });

    it("applies correct editor attributes for styling", () => {
      render(<TextEditor {...defaultProps} />);

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
      render(<TextEditor {...defaultProps} />);

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
      const { container } = render(<TextEditor {...defaultProps} />);

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
      const { container } = render(<TextEditor {...defaultProps} />);

      const editorContainer = container.firstChild as HTMLElement;
      expect(editorContainer.className).toContain(
        "border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden",
      );
    });

    it("applies correct editor prose classes", () => {
      render(<TextEditor {...defaultProps} />);

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
      render(<TextEditor {...defaultProps} />);

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
      render(<TextEditor {...defaultProps} />);

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
