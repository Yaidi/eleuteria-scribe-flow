import { useCurrentEditor } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { List, ListOrdered } from "lucide-react";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { Bold, Italic, Strikethrough, Code } from "lucide-react";

const useEditorState = () => {
  const { editor } = useCurrentEditor();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      forceUpdate({});
    };

    editor.on("selectionUpdate", updateHandler);
    editor.on("transaction", updateHandler);

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("transaction", updateHandler);
    };
  }, [editor]);

  return { editor };
};

const TextEditorMenuBar: React.FC = () => {
  const { editor } = useEditorState();

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 p-2">
      <div className="flex flex-wrap gap-1">
        {/* Formato de texto básico */}
        <div className="flex gap-1">
          <button
            data-testid="button-bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
          ${
            editor.isActive("bold")
              ? "bg-gray-900 dark:bg-slate-500 text-white"
              : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            data-testid="button-italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
          ${
            editor.isActive("italic")
              ? "bg-gray-900 dark:bg-slate-500 text-white"
              : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            data-testid="button-strike"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
          ${
            editor.isActive("strike")
              ? "bg-gray-900 dark:bg-slate-500 text-white"
              : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            data-testid="button-code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
          ${
            editor.isActive("code")
              ? "bg-gray-900 dark:bg-slate-500 text-white"
              : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-500 mx-2 self-center" />

        {/* Encabezados */}
        <div className="flex gap-1">
          <button
            data-testid="button-heading-1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
            ${
              editor.isActive("heading", { level: 1 })
                ? "bg-gray-900 dark:bg-slate-500 text-white"
                : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
            }`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            data-testid="button-heading-2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
            ${
              editor.isActive("heading", { level: 2 })
                ? "bg-gray-900 dark:bg-slate-500 text-white"
                : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
            }`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            data-testid="button-heading-3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
            ${
              editor.isActive("heading", { level: 3 })
                ? "bg-gray-900 dark:bg-slate-500 text-white"
                : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
            }`}
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-500 mx-2 self-center" />

        {/* Listas y bloques */}
        <div className="flex gap-1">
          <button
            data-testid="button-bullet-list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
            ${
              editor.isActive("bulletList")
                ? "bg-gray-900 dark:bg-slate-500 text-white"
                : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            data-testid="button-ordered-list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors
            ${
              editor.isActive("orderedList")
                ? "bg-gray-900 dark:bg-slate-500 text-white"
                : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-500 mx-2 self-center" />

        {/* Acciones especiales */}
        <div className="flex gap-1">
          <button
            data-testid="button-undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            data-testid="button-redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorMenuBar;
