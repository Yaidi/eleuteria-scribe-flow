import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextEditorMenuBar from "@/components/ui/text-editor-menu-bar.tsx";

const extensions = [StarterKit];

const content = "";

const TextEditor = () => {
  return (
    <div className="border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
      <EditorProvider
        extensions={extensions}
        content={content}
        slotBefore={<TextEditorMenuBar />}
        editorProps={{
          attributes: {
            class:
              "prose prose-sm dark:prose-invert m-0 p-4 focus:outline-none h-[500px] max-w-none overflow-y-auto bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100",
          },
        }}
      />
    </div>
  );
};

export default TextEditor;
