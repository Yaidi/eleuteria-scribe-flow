import { Button } from "@/components/ui/button.tsx";
import { ESections, PriorityType } from "@/types/sections.ts";
import React, { useState } from "react";
import { Book, ChevronDown, ChevronRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  selectChapter,
  selectScene,
  setCurrentCharacter,
  setCurrentPlot,
  updateCharacter,
  updatePlot,
} from "@/store";
import { useSections } from "@/hooks/useSections.ts";
import { useDispatch } from "react-redux";
import { RequestUpdateCharacter } from "@/types/requests.ts";
import { AppDispatch } from "@/store/config.ts";

interface SidebarProps {
  activeSection: ESections;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  const { characters, manuscript, plots } = useSections();
  const [dragOverRole, setDragOverRole] = useState<PriorityType | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    );
  };

  const changeImportance = (characterId: number, importance: PriorityType) => {
    const requestupdateCharacter: RequestUpdateCharacter = {
      id: characterId,
      info: { importance: importance },
    };
    dispatch(updateCharacter(requestupdateCharacter));
  };
  const changeImportancePlot = (plotId: number, importance: PriorityType) => {
    dispatch(updatePlot({ plot: { id: plotId, importance: importance } }));
  };
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, characterId: number) => {
    e.dataTransfer.setData("text/plain", characterId.toString());
    setSelectedCharacter(characterId);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  switch (activeSection) {
    case ESections.characters:
      return (
        <div className="space-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-r border-t rounded-br-md border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3
              data-testid="character-section-title"
              className="dark:text-gray-50 font-semibold text-sm text-gray-700"
            >
              Characters
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
              <h4 className="text-xs font-medium uppercase tracking-wide">{PriorityType[role]}</h4>
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
    case ESections.manuscript:
      return (
        <div className="space-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-r border-t rounded-br-md border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700">Structure</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {manuscript.chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              <div className="flex items-center space-x-1">
                <Button
                  data-testid={`btn-chapter-${chapter.id}`}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  {expandedChapters.includes(chapter.id) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 justify-start h-7 px-2 text-xs",
                    manuscript.currentChapter?.id === chapter.id && "bg-blue-100 text-blue-700",
                  )}
                  onClick={() => selectChapter(chapter)}
                >
                  <Book className="w-3 h-3 mr-1" />
                  {chapter.title}
                </Button>
              </div>

              {expandedChapters.includes(chapter.id) && (
                <div className="ml-6 space-y-1">
                  {chapter.scenes.map((scene) => (
                    <Button
                      key={scene.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-6 px-2 text-xs",
                        manuscript.currentScene?.id === scene.id && "bg-blue-100 text-blue-700",
                      )}
                      onClick={() => selectScene(scene)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {scene.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    case ESections.plots:
      return (
        <div className="space-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-r border-t rounded-br-md border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3
              data-testid="character-section-title"
              className="dark:text-gray-50 font-semibold text-sm text-gray-700"
            >
              Plots
            </h3>
          </div>
          {[PriorityType.MAIN, PriorityType.SECONDARY, PriorityType.MINOR].map((role) => (
            <div
              id={PriorityType[role]}
              key={role}
              onDrop={(e) => {
                e.preventDefault();
                const plot = parseInt(e.dataTransfer.getData("text/plain"));
                setDragOverRole(null);
                changeImportancePlot(plot, role);
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
              <h4 className="text-xs font-medium uppercase tracking-wide">{PriorityType[role]}</h4>
              {plots.plots
                .filter((plot) => plot.importance === role)
                .map((plot) => (
                  <Button
                    data-testid={`character-${plot.id}`}
                    draggable={true}
                    onDragEnd={() => setSelectedCharacter(null)}
                    onDragStart={(e) => handleDragStart(e, plot.id)}
                    onClick={() => dispatch(setCurrentPlot(plot))}
                    key={plot.id.toString()}
                    variant="ghost"
                    size="default"
                    className={cn(
                      "w-full justify-start h-7 px-2 text-xs cursor-move",
                      selectedCharacter === plot.id && "opacity-50",
                    )}
                  >
                    <div className="w-3 h-3 rounded-full mr-2" />
                    {plot.title}
                  </Button>
                ))}
            </div>
          ))}
        </div>
      );
    default:
      return <div data-testid="default"></div>;
  }
};

export default Sidebar;
