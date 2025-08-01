import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useDispatch } from "react-redux";
import FormsCharacters from "@/components/FormsCharacters.tsx";
import { useProjectId, useSections } from "@/hooks/useSections.ts";
import { AppDispatch } from "@/store/config.ts";
import { addCharacterFetch } from "@/store";

const Characters = () => {
  const { characters, currentCharacter } = useSections().characters;
  const projectId = useProjectId();
  const dispatch = useDispatch<AppDispatch>();

  const add = (id: number) => {
    dispatch(addCharacterFetch(id));
  };

  if (!projectId) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Characters</CardTitle>
        <Button data-testid="btn-add-character" onClick={() => add(projectId)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {characters.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No characters added yet. Click "Add Character" to get started.
            </div>
          )}
          {currentCharacter && <FormsCharacters character={currentCharacter} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default Characters;
