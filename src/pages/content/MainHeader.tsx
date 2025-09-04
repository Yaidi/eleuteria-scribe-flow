import { Badge } from "@/components/ui/badge.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import React, { useEffect, useState } from "react";
import { ProjectData } from "@/types/project.ts";

export interface MainHeaderProps {
  currentProject: ProjectData;
}

const MainHeader: React.FC<MainHeaderProps> = ({ currentProject }) => {
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
    <header className="px-6 pb-4 backdrop-blur-sm flex items-center justify-between">
      <div className="flex justify-between items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-800">
            {currentProject.projectName}
          </h1>
          <div className="flex items-center space-x-4 mt-1">
            <Badge variant="outline" className="text-xs dark:border-gray-50">
              {currentProject.type}
            </Badge>
            {wordGoal && (
              <>
                <span className="text-sm text-gray-500">{`${words} / ${wordGoal} words`}</span>
                <Progress
                  data-testid="progressbar"
                  value={getProgressPercentage()}
                  className="w-32 h-2"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default MainHeader;
