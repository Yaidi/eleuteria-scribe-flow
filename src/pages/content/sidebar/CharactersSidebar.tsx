import { PriorityType } from "@/types/sections.ts";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { addCharacterFetch, setCurrentCharacter, updateCharacter } from "@/store";
import { RequestUpdateCharacter } from "@/types/requests.ts";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config.ts";
import { useProjectId, useSections } from "@/hooks/useSections.ts";
import React, { useState } from "react";
import { Plus } from "lucide-react";

const CharactersSidebar = () => {
  const { t } = useTranslation("characters");
  const projectId = useProjectId();
  const { characters, currentCharacter } = useSections().characters;
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);

  const [dragOverRole, setDragOverRole] = useState<PriorityType | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const changeImportance = (characterId: number, importance: PriorityType) => {
    const requestupdateCharacter: RequestUpdateCharacter = {
      id: characterId,
      info: { importance: importance },
    };
    dispatch(updateCharacter(requestupdateCharacter));
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, characterId: number) => {
    e.dataTransfer.setData("text/plain", characterId.toString());
    setSelectedCharacter(characterId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const add = (id: number) => {
    dispatch(addCharacterFetch(id));
  };

  return (
    <div className="flex flex-col w-full px-4 py-6 gap-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-l rounded-br-md border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h3
          data-testid="character-section-title"
          className="dark:text-gray-50 font-semibold text-gray-700 text-start"
        >
          {t("title")}
        </h3>
        <Button
          data-testid="btn-add-character"
          className="h-6 w-6 p-0"
          variant="ghost"
          onClick={() => add(projectId)}
          size="sm"
          aria-label={t("addCharacter")}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {[PriorityType.MAIN, PriorityType.SECONDARY, PriorityType.MINOR].map((role) => (
        <div
          id={PriorityType[role]}
          key={role}
          onDrop={(e) => {
            e.preventDefault();
            const characterId = parseInt(e.dataTransfer.getData("text/plain"));
            setDragOverRole(null);
            changeImportance(characterId, role);
          }}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOverRole(role);
          }}
          className={cn(
            "flex flex-col p-2 gap-y-2 dark:text-gray-100 text-gray-600 rounded-lg",
            dragOverRole === role &&
              "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
          )}
        >
          <h4 className="text-xs text-start font-medium uppercase tracking-wide pb-2 border-b-2">
            {t(`importance.${role}`)}
          </h4>
          {characters
            .filter((char) => char.importance === role)
            .map((character) => (
              <Button
                data-testid={`character-${character.id}`}
                draggable
                onDragEnd={() => setSelectedCharacter(null)}
                onDragStart={(e) => handleDragStart(e, character.id)}
                onClick={() => dispatch(setCurrentCharacter(character))}
                key={character.id}
                variant="ghost"
                size="default"
                className={cn(
                  "w-full justify-start h-auto px-2 text-xs cursor-move",
                  selectedCharacter === character.id && "opacity-50",
                  currentCharacter?.id === character.id && "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <div className="w-3 h-3 rounded-full shrink-0" />
                <span className="whitespace-normal break-words break-all max-w-full">
                  {character.name}
                </span>
              </Button>
            ))}
        </div>
      ))}
    </div>
  );
};

export default CharactersSidebar;
