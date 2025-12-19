import { Badge } from "@/components/ui/badge.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import React, { useEffect, useState } from "react";
import { IProject } from "@/types/project.ts";
import { useTranslation } from "react-i18next";

export interface MainHeaderProps {
  currentProject: IProject;
}

const MainHeader: React.FC<MainHeaderProps> = ({ currentProject }) => {
  const { t } = useTranslation("project");

  const [autoSave, setAutoSave] = useState(true);
  const { words, wordGoal } = currentProject;

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
    <header className="flex flex-col px-6 pb-4 backdrop-blur-sm items-start justify-between">
      <h1 className="text-2xl font-bold dark:text-white text-gray-800">
        {currentProject.projectName ?? "Untitled"}
      </h1>
      <div data-testid="words" className="flex items-center space-x-4 mt-1">
        <div className="flex flex-col gap-y-2">
          <span
            className="text-sm text-gray-500"
            aria-label={t("wordsComparisonAy11", { words: words, wordGoal: wordGoal })}
          >
            {t("wordsComparison", { words: words, wordGoal: wordGoal })}
          </span>
          <Progress
            data-testid="progressbar"
            value={getProgressPercentage()}
            className="w-32 h-2"
          />
        </div>
        <Badge variant="outline" className="text-xs dark:border-gray-50">
          {t(`type.${currentProject.type}`)}
        </Badge>
      </div>
    </header>
  );
};
export default MainHeader;
