import { Button } from "@/components/ui/button";
import { ESections } from "@/types/sections.ts";
import React, { useState } from "react";
import { Book, ChevronDown, ChevronRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { selectChapter, selectScene } from "@/store";
import { useSections } from "@/hooks/useSections.ts";

interface SidebarProps {
  activeSection: ESections;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  const { characters, manuscript } = useSections();
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    );
  };

  switch (activeSection) {
    case ESections.Characters:
      return (
        <div className="space-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-r rounded-t-sm border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="dark:text-gray-50 font-semibold text-sm text-gray-700">Characters</h3>
          </div>
          {["Main", "Secondary", "Minor"].map((role) => (
            <div key={role} className="space-y-1">
              <h4 className="dark:text-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
                {role}
              </h4>
              {characters
                .filter((char) => char.importance === role.toLowerCase())
                .map((character) => (
                  <Button
                    key={character.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 px-2 text-xs"
                  >
                    <div className="w-3 h-3 rounded-full mr-2" />
                    {character.name}
                  </Button>
                ))}
            </div>
          ))}
        </div>
      );
    case ESections.Manuscript:
      return (
        <div className="space-y-2">
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
    default:
      return <div></div>;
  }
};

export default Sidebar;
