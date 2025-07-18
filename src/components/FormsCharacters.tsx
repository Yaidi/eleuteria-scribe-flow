import { Label } from "recharts";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { ICharacter, PriorityType } from "@/types/sections.ts";
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config.ts";
import { deleteCharacterFetch, updateCharacter } from "@/store";

interface FormsCharactersProps {
  character: ICharacter;
}

const FormsCharacters: React.FC<FormsCharactersProps> = ({ character }) => {
  const dispatch = useDispatch<AppDispatch>();
  const update = (id: number, info: Partial<ICharacter>) => {
    dispatch(updateCharacter({ id, info }));
  };
  const getImportance = (role: string): PriorityType => {
    return parseInt(role) as PriorityType;
  };

  const remove = (id: number) => {
    dispatch(deleteCharacterFetch(id));
  };

  return (
    <div data-testid="character-form" key={character.id} className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div>
            <Label>Name</Label>
            <Input
              data-testid="input-character-name"
              name="name"
              value={character.name}
              onChange={(e) => update(character.id, { name: e.target.value })}
              placeholder="Character name"
            />
          </div>
          <div>
            <Label>Importance</Label>
            <Select
              name="importance"
              value={character.importance?.toString()}
              onValueChange={(value: string) =>
                update(character.id, {
                  importance: getImportance(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue defaultValue={character.importance?.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Main Character</SelectItem>
                <SelectItem value="1">Secondary Character</SelectItem>
                <SelectItem value="2">Minor Character</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={() => remove(character.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Characteristics</Label>
          <Textarea
            name="characteristics"
            value={character.characteristics}
            onChange={(e) => update(character.id, { characteristics: e.target.value })}
            placeholder="Physical appearance, personality traits..."
          />
        </div>
      </div>
    </div>
  );
};

export default FormsCharacters;
