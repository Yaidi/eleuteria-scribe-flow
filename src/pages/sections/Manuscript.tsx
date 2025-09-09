import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { ESections } from "@/types/sections.ts";
import React from "react";
import TextEditor from "@/components/ui/text-editor.tsx";
import { useSaveScene } from "@/hooks/useSections.ts";

interface ManuscriptProps {
  section: ESections;
}

const Manuscript: React.FC<ManuscriptProps> = ({ section }) => {
  const saveScene = useSaveScene();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{section.toString()}</CardTitle>
      </CardHeader>
      <CardContent>
        <TextEditor onSaveScene={saveScene} />
      </CardContent>
    </Card>
  );
};

export default Manuscript;
