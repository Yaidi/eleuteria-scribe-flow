import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ICharacter, PriorityType } from "@/types/sections.ts";
import { Button } from "@/components/ui/button.tsx";
import { addCharacter } from "@/store";
import { useDispatch } from "react-redux";
import FormsCharacters from "@/components/FormsCharacters.tsx";
import { useSections } from "@/hooks/useSections.ts";

const Characters = () => {
  const { characters } = useSections();
  const dispatch = useDispatch();

  const add = () => {
    const newCharacter: Partial<ICharacter> = {
      name: "",
      importance: PriorityType.MINOR,
      characteristics: "",
    };
    dispatch(addCharacter(newCharacter));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Characters</CardTitle>
        <Button onClick={add} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {characters.map((character) => (
            <FormsCharacters key={character.id} character={character} />
          ))}
          {characters.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No characters added yet. Click "Add Character" to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Characters;
