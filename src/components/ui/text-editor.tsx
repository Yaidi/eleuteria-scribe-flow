import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextEditorMenuBar from "@/components/ui/text-editor-menu-bar.tsx";

const extensions = [StarterKit];

const content = "";

const TextEditor = () => {
  return (
    <EditorProvider
      extensions={extensions}
      content={content}
      slotBefore={<TextEditorMenuBar />}
      editorProps={{
        attributes: {
          class:
            "prose prose-sm m-5 focus:outline-none border border-gray-300 rounded-lg p-4 h-[500px] max-w-none overflow-y-auto",
        },
      }}
    />
  );
};

export default TextEditor;
