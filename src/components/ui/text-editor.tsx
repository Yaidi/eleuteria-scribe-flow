import { Editor, EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextEditorMenuBar from "@/components/ui/text-editor-menu-bar.tsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CharacterCount } from "@tiptap/extensions";
import { useManuscript } from "@/hooks/useSections.ts";

const wordCounter = CharacterCount.configure({
  wordCounter: (text) => text.split(/\s+/).filter((word) => word !== "").length,
});

const extensions = [StarterKit, wordCounter];

interface TextEditorProps {
  initialContent?: string;
  onSaveScene: (content: string) => void;
  autoSaveDelay?: number; // in millis
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = "",
  onSaveScene,
  autoSaveDelay = 1000,
}) => {
  const [content, setContent] = useState(initialContent);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(initialContent);
  const manuscriptState = useManuscript();

  const scheduleAutoSave = useCallback(
    (newContent: string) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Solo programar autoguardado si el contenido ha cambiado
      if (newContent !== lastContentRef.current && !manuscriptState.isSaving) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          onSaveScene(newContent);
        }, autoSaveDelay);
      }
    },
    [autoSaveDelay, manuscriptState.isSaving, onSaveScene],
  );

  const handleEditorUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      scheduleAutoSave(newContent);
    },
    [scheduleAutoSave],
  );

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Guardar cuando la ventana se cierre
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (content !== lastContentRef.current) {
        e.preventDefault();
        onSaveScene(content);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [content, onSaveScene]);

  return (
    <div className="border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
      <EditorProvider
        extensions={extensions}
        content={content}
        slotBefore={
          <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-slate-600">
            <TextEditorMenuBar />
          </div>
        }
        onUpdate={handleEditorUpdate}
        editorProps={{
          attributes: {
            class:
              "prose prose-sm dark:prose-invert m-0 p-4 focus:outline-none h-[500px] max-w-none overflow-y-auto bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-left",
          },
        }}
      />
    </div>
  );
};

export default TextEditor;
