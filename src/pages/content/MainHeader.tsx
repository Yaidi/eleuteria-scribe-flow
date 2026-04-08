import { Badge } from "@/components/ui/badge.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import React, { useEffect, useState } from "react";
import { IProject } from "@/types/project.ts";
import { useTranslation } from "react-i18next";
import { useSections } from "@/hooks/useSections.ts";

export interface MainHeaderProps {
  currentProject: IProject;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ currentProject }) => {
  const { t } = useTranslation("project");

  const [autoSave, setAutoSave] = useState(true);
  const { words, wordGoal } = currentProject;
  const { title } = useSections().general.general;

  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        localStorage.setItem("eleuteria-project", JSON.stringify(currentProject));
      }, 2);
      return () => {
        clearTimeout(timer);
        setAutoSave(false);
      };
    }
  }, [currentProject, autoSave]);

  const getProgressPercentage = () => {
    if (!wordGoal || !words) return 0;
    return (words / wordGoal) * 100;
  };

  return (
    <header className="flex flex-col px-6 py-6 items-center justify-around gap-y-2 backdrop-blur-sm border-b-2 w-full">
      <aside className="flex gap-2">
        <h1 className="text-2xl font-bold dark:text-white text-gray-800">
          {title ?? t("untitled")}
        </h1>
        <Badge variant="default" className="text-xs px-1 py-0.5 justify-center dark:border-gray-50">
          {t(`type.${currentProject.type}`)}
        </Badge>
      </aside>
      <aside className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-600">{t("writtingProgress")}</span>
          <span
            className="text-sm text-gray-500"
            aria-label={t("wordsComparisonAy11", { words: words, wordGoal: wordGoal })}
          >
            {t("wordsComparison", { words: words, wordGoal: wordGoal })}
          </span>
        </div>
        <Progress data-testid="progressbar" value={getProgressPercentage()} className="h-2" />
      </aside>
    </header>
  );
};
export default MainHeader;
