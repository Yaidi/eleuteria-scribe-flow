import { Editor, EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextEditorMenuBar from "@/components/ui/text-editor-menu-bar.tsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CharacterCount } from "@tiptap/extensions";
import { Button } from "@/components/ui/button.tsx";

const wordCounter = CharacterCount.configure({
  wordCounter: (text) => text.split(/\s+/).filter((word) => word !== "").length,
});

const extensions = [StarterKit, wordCounter];

interface TextEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  project_id: number;
  filename?: string;
  relativePath?: string;
  autoSaveDelay?: number; // en milisegundos
}

const saveChunkToServer = async (
  contentToSave: string,
  sessionId: string,
  filename: string,
  relativePath: string,
) => {
  const formData = new FormData();
  const blob = new Blob([contentToSave], { type: "text/markdown" });
  formData.append("file", blob, filename);
  formData.append("relative_path", relativePath);

  await fetch(`http://localhost:8000/manuscript/save/chunk/${sessionId}`, {
    method: "POST",
    body: formData,
  });
};

const startSaveSession = async (filename: string, relativePath: string, projectId: number) => {
  const res = await fetch(`http://localhost:8000/manuscript/save/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: projectId,
      relative_path: relativePath,
      filename: filename,
    }),
  });

  const data = await res.json();
  return data.session_id;
};

const finishSaveSession = async (sessionId: string) => {
  const response = await fetch(`http://localhost:8000/manuscript/save/finish/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to finish save session: ${response.statusText}`);
  }

  return await response.json();
};

const SaveStatus: React.FC<{ isSaving: boolean; lastSaved: Date | null }> = ({
  isSaving,
  lastSaved,
}) => {
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      {isSaving ? (
        <span>Guardando...</span>
      ) : lastSaved ? (
        <span>Guardado {lastSaved.toLocaleTimeString()}</span>
      ) : (
        <span>Sin guardar</span>
      )}
    </div>
  );
};

const ManualSaveButton: React.FC<{ onSave: () => void; disabled: boolean }> = ({
  onSave,
  disabled,
}) => {
  const { editor } = useCurrentEditor();

  const handleSave = () => {
    if (editor && !disabled) {
      onSave();
    }
  };

  return (
    <Button onClick={handleSave} disabled={disabled} className="ml-2">
      Guardar
    </Button>
  );
};

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = "",
  onSave,
  project_id,
  filename = "document.md",
  relativePath = "/file1",
  autoSaveDelay = 10000, // 2 segundos por defecto
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(initialContent);
  const sessionRef = useRef<string | null>(null);

  const saveDocument = useCallback(
    async (contentToSave: string) => {
      setIsSaving(true);
      try {
        if (!sessionRef.current) {
          sessionRef.current = await startSaveSession(filename, relativePath, project_id);
        }

        await saveChunkToServer(contentToSave, sessionRef.current ?? "", filename, relativePath);

        // Finalizar la sesión (esto mueve el archivo temporal al destino final)
        await finishSaveSession(sessionRef.current ?? "");

        // Reset session para próximo guardado
        sessionRef.current = null;

        setLastSaved(new Date());
        lastContentRef.current = contentToSave;
        if (onSave) {
          onSave(contentToSave);
        }
      } catch (error) {
        console.error("Error saving file:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [filename, onSave, project_id, relativePath],
  );

  const scheduleAutoSave = useCallback(
    (newContent: string) => {
      // Cancelar el autoguardado anterior si existe
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Solo programar autoguardado si el contenido ha cambiado
      if (newContent !== lastContentRef.current && !isSaving) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          saveDocument(newContent);
        }, autoSaveDelay);
      }
    },
    [saveDocument, autoSaveDelay, isSaving],
  );

  const handleEditorUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      scheduleAutoSave(newContent);
    },
    [scheduleAutoSave],
  );

  const handleManualSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    saveDocument(content);
  }, [content, saveDocument]);

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
        saveDocument(content);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [content, saveDocument]);

  return (
    <div className="border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
      <EditorProvider
        extensions={extensions}
        content={content}
        slotBefore={
          <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-slate-600">
            <TextEditorMenuBar />
            <div className="flex items-center gap-2">
              <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />
              <ManualSaveButton
                onSave={handleManualSave}
                disabled={isSaving || content === lastContentRef.current}
              />
            </div>
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
