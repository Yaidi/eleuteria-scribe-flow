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
import { useTranslation } from "react-i18next";

interface FormsCharactersProps {
  character: ICharacter;
}

const FormsCharacters: React.FC<FormsCharactersProps> = ({ character }) => {
  const { t } = useTranslation("characters");

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
    <div
      data-testid="form-character"
      key={character.id}
      className="flex flex-col border rounded-lg p-4 gap-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div>
            <Label>{t("character.name.label")}</Label>
            <Input
              data-testid="input-character-name"
              name="name"
              value={character.name}
              onChange={(e) => update(character.id, { name: e.target.value })}
              placeholder={t("character.name.placeholder")}
            />
          </div>
          <div>
            <Label id="importance-id">{t("importance.label")}</Label>
            <Select
              name="importance"
              value={character.importance.toString()}
              onValueChange={(value: string) =>
                update(character.id, {
                  importance: getImportance(value),
                })
              }
            >
              <SelectTrigger aria-labelledby="importance-id">
                <SelectValue defaultValue={character.importance.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("importance.0")}</SelectItem>
                <SelectItem value="1">{t("importance.1")}</SelectItem>
                <SelectItem value="2">{t("importance.2")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Label>{t("characteristics.label")}</Label>
        <Textarea
          data-testid="textarea-characteristics"
          name="characteristics"
          value={character.characteristics}
          onChange={(e) => update(character.id, { characteristics: e.target.value })}
          placeholder={t("characteristics.placeholder")}
        />
      </div>
      <Button
        className="w-1/3 self-end"
        aria-label={t("character.delete")}
        data-testid="btn-remove-character"
        variant="destructive"
        size="sm"
        onClick={() => remove(character.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FormsCharacters;
