import { Button } from "@/components/ui/button.tsx";
import { Book, ChevronDown, ChevronRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { addChapter, getManuscriptList, selectChapter, selectScene } from "@/store";
import { useEffect, useState } from "react";
import { useProjectId, useSections } from "@/hooks/useSections.ts";
import { useTranslation } from "react-i18next";
import { IChapter, Scene } from "@/types/sections.ts";
import { AppDispatch } from "@/store/config.ts";
import { useDispatch } from "react-redux";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

const ManuscriptSidebar = () => {
  const { t } = useTranslation("manuscript");

  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { manuscript } = useSections();
  const projectId = useProjectId();

  useEffect(() => {
    dispatch(getManuscriptList(projectId));
  }, [dispatch, projectId]);

  const createNewChapter = () => {
    const newChapterId = `chapter-${Date.now()}`;
    const newSceneId = `scene-${Date.now()}`;

    const newScene: Scene = {
      path: newSceneId,
      title: `Nueva Escena 1`,
      content: "",
      wordCount: 0,
      wordGoal: 0,
      characters: [],
    };

    const newChapter: IChapter = {
      path: newChapterId,
      title: `Nuevo Capítulo ${manuscript.chapters.length + 1}`,
      description: "",
      scenes: [newScene],
    };

    dispatch(addChapter(newChapter));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    );
  };
  return (
    <div className="flex flex-col h-full w-full px-4 py-6 gap-y-2 bg-slate-50 dark:text-gray-50 dark:bg-slate-900 border-l rounded-br-md border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700">{t("structure")}</h3>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          aria-label={t("addChapter")}
          onClick={() => createNewChapter()}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="flex h-[85%]">
        {manuscript.chapters.map((chapter) => (
          <div key={chapter.path} className="space-y-1">
            <div className="flex items-center space-x-1">
              <Button
                data-testid={`btn-chapter-${chapter.path}`}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleChapter(chapter.path)}
              >
                {expandedChapters.includes(chapter.path) ? (
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
                  manuscript.currentChapter?.path === chapter.path && "bg-blue-100 text-blue-700",
                )}
                onClick={() => selectChapter(chapter)}
              >
                <Book className="w-3 h-3 mr-1" />
                {chapter.title}
              </Button>
            </div>

            {expandedChapters.includes(chapter.path) && (
              <div className="ml-6 space-y-1">
                {chapter.scenes.map((scene) => (
                  <Button
                    key={scene.path}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-6 px-2 text-xs",
                      manuscript.currentScene?.path === scene.path && "bg-blue-100 text-blue-700",
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
      </ScrollArea>
    </div>
  );
};
export default ManuscriptSidebar;
