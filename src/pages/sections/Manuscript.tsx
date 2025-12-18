import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import TextEditor from "@/components/ui/text-editor.tsx";
import { useManuscript, useSaveScene } from "@/hooks/useSections.ts";

const Manuscript = () => {
  const saveScene = useSaveScene();
  const manuscript = useManuscript();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          {manuscript.currentChapter?.title || manuscript.currentScene?.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TextEditor onSaveScene={saveScene} />
      </CardContent>
    </Card>
  );
};

export default Manuscript;
