import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TextEditorMenuBar from "@/components/ui/text-editor-menu-bar";

import { useCurrentEditor } from "@tiptap/react";
import { mockEditor, mockIsActive } from "../../../mocks/textEditorMocks";

vi.mock("@tiptap/react", () => ({
  useCurrentEditor: vi.fn(() => ({
    editor: mockEditor,
  })),
}));

describe("TextEditorMenuBar", () => {
  beforeEach(() => {
    vi.mocked(useCurrentEditor).mockReturnValue({ editor: mockEditor });
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("correctly render when editor is available", () => {
      render(<TextEditorMenuBar />);

      expect(screen.getByTestId("button-bold")).toBeDefined();
      expect(screen.getByTestId("button-italic")).toBeDefined();
      expect(screen.getByTestId("button-strike")).toBeDefined();
      expect(screen.getByTestId("button-code")).toBeDefined();
    });

    it("not render when editor is not available", () => {
      vi.mocked(useCurrentEditor).mockReturnValue({ editor: null });

      const { container } = render(<TextEditorMenuBar />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Basic format buttons", () => {
    it("execute toggleBold when click on bold button", () => {
      render(<TextEditorMenuBar />);

      const boldButton = screen.getByTestId("button-bold");
      fireEvent.click(boldButton);

      expect(mockEditor.chain().focus().toggleBold().run).toHaveBeenCalled();
    });

    it("execute toggleItalic when click on italic button", () => {
      render(<TextEditorMenuBar />);

      const italicButton = screen.getByTestId("button-italic");
      fireEvent.click(italicButton);

      expect(mockEditor.chain().focus().toggleItalic().run).toHaveBeenCalled();
    });

    it("execute toggleStrike when click on strike button", () => {
      render(<TextEditorMenuBar />);

      const strikeButton = screen.getByTestId("button-strike");
      fireEvent.click(strikeButton);

      expect(mockEditor.chain().focus().toggleStrike().run).toHaveBeenCalled();
    });

    it("execute toggleCode when click on code button", () => {
      render(<TextEditorMenuBar />);

      const codeButton = screen.getByTestId("button-code");
      fireEvent.click(codeButton);

      expect(mockEditor.chain().focus().toggleCode().run).toHaveBeenCalled();
    });
  });

  describe("Heading Buttons", () => {
    it("execute toggleHeading with level 1 when click on H1", () => {
      render(<TextEditorMenuBar />);

      const h1Button = screen.getByTestId("button-heading-1");
      fireEvent.click(h1Button);

      expect(mockEditor.chain().focus().toggleHeading({ level: 1 }).run).toHaveBeenCalled();
    });

    it("execute toggleHeading with level 2 when click on H2", () => {
      render(<TextEditorMenuBar />);

      const h2Button = screen.getByTestId("button-heading-2");
      fireEvent.click(h2Button);

      expect(mockEditor.chain().focus().toggleHeading({ level: 2 }).run).toHaveBeenCalled();
    });

    it("execute toggleHeading with level 3 when click on H3", () => {
      render(<TextEditorMenuBar />);

      const h3Button = screen.getByTestId("button-heading-3");
      fireEvent.click(h3Button);

      expect(mockEditor.chain().focus().toggleHeading({ level: 3 }).run).toHaveBeenCalled();
    });
  });

  describe("List Buttons", () => {
    it("execute toggleBulletList when click on list button", () => {
      render(<TextEditorMenuBar />);

      const listButton = screen.getByTestId("button-bullet-list");
      fireEvent.click(listButton);

      expect(mockEditor.chain().focus().toggleBulletList().run).toHaveBeenCalled();
    });

    it("execute toggleOrderedList when click on ordered list button", () => {
      render(<TextEditorMenuBar />);

      const orderedListButton = screen.getByTestId("button-ordered-list");
      fireEvent.click(orderedListButton);

      expect(mockEditor.chain().focus().toggleOrderedList().run).toHaveBeenCalled();
    });
  });

  describe("Undo/Redo Buttons", () => {
    it("execute undo when click on undo button", () => {
      render(<TextEditorMenuBar />);

      const undoButton = screen.getByTestId("button-undo");
      fireEvent.click(undoButton);

      expect(mockEditor.chain().focus().undo().run).toHaveBeenCalled();
    });

    it("execute redo when click on redo button", () => {
      render(<TextEditorMenuBar />);

      const redoButton = screen.getByTestId("button-redo");
      fireEvent.click(redoButton);

      expect(mockEditor.chain().focus().redo().run).toHaveBeenCalled();
    });
  });

  describe("Active states", () => {
    it("apply active class when format is active", () => {
      mockIsActive.mockImplementation((format) => format === "bold");

      render(<TextEditorMenuBar />);

      const boldButton = screen.getByTestId("button-bold");
      expect(boldButton.className).toContain("bg-gray-900");
      expect(boldButton.className).toContain("text-white");
    });

    it("apply active class when heading is active", () => {
      mockIsActive.mockImplementation(
        (format, options) => format === "heading" && options?.level === 1,
      );

      render(<TextEditorMenuBar />);

      const h1Button = screen.getByTestId("button-heading-1");
      expect(h1Button.className).toContain("bg-gray-900");
      expect(h1Button.className).toContain("text-white");
    });

    it("apply active class when list is active", () => {
      mockIsActive.mockImplementation((format) => format === "bulletList");

      render(<TextEditorMenuBar />);

      const listButton = screen.getByTestId("button-bullet-list");
      expect(listButton.className).toContain("bg-gray-900");
      expect(listButton.className).toContain("text-white");
    });
  });
});
