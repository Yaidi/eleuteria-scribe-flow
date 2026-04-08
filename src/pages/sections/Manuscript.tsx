import { CardHeader } from "@/components/ui/card.tsx";
import TextEditor from "@/components/ui/text-editor.tsx";
import { useManuscript, useSaveScene } from "@/hooks/useSections.ts";

const Manuscript = () => {
  const saveScene = useSaveScene();
  const manuscript = useManuscript();

  return (
    <section>
      <CardHeader>
        <h1 className="capitalize text-2xl font-semibold">
          {manuscript.currentChapter?.title || manuscript.currentScene?.title}
        </h1>
      </CardHeader>
      <TextEditor onSaveScene={saveScene} />
    </section>
  );
};

export default Manuscript;
