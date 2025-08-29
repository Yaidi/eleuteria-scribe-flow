import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { ESections } from "@/types/sections.ts";
import React from "react";
import TextEditor from "@/components/ui/text-editor.tsx";

interface ManuscriptProps {
  section: ESections;
}

const Manuscript: React.FC<ManuscriptProps> = ({ section }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{section.toString()}</CardTitle>
      </CardHeader>
      <CardContent>
        <TextEditor project_id={1} />
      </CardContent>
    </Card>
  );
};

export default Manuscript;
