import { PriorityType } from "@/types/sections.ts";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { setCurrentCharacter, updateCharacter } from "@/store";
import { RequestUpdateCharacter } from "@/types/requests.ts";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config.ts";
import { useSections } from "@/hooks/useSections.ts";
import React, { useState } from "react";

const CharactersSidebar = () => {
  const { t } = useTranslation("characters");
  const { characters } = useSections();
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

  return (
    <div className="space-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-r border-t rounded-br-md border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3
          data-testid="character-section-title"
          className="dark:text-gray-50 font-semibold text-sm text-gray-700"
        >
          {t("title")}
        </h3>
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
            "space-y-1 p-2 dark:text-gray-100 text-gray-600 rounded-lg",
            dragOverRole === role &&
              "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
          )}
        >
          <h4 className="text-xs font-medium uppercase tracking-wide">{t(`importance.${role}`)}</h4>
          {characters.characters
            .filter((char) => char.importance === role)
            .map((character) => (
              <Button
                data-testid={`character-${character.id}`}
                draggable={true}
                onDragEnd={() => setSelectedCharacter(null)}
                onDragStart={(e) => handleDragStart(e, character.id)}
                onClick={() => dispatch(setCurrentCharacter(character))}
                key={character.id.toString()}
                variant="ghost"
                size="default"
                className={cn(
                  "w-full justify-start h-7 px-2 text-xs cursor-move",
                  selectedCharacter === character.id && "opacity-50",
                )}
              >
                <div className="w-3 h-3 rounded-full mr-2" />
                {character.name}
              </Button>
            ))}
        </div>
      ))}
    </div>
  );
};

export default CharactersSidebar;
