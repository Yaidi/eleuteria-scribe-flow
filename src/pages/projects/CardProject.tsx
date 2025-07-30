import { ProjectType } from "@/types/project.ts";
import React from "react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";

export interface CardProjectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  projectType: ProjectType;
  className?: string;
}

const CardProject: React.FC<CardProjectProps> = ({
  children,
  projectType,
  className,
  ...props
}) => {
  const typeColors: Record<ProjectType, string> = {
    [ProjectType.novel]:
      "focus:border-blue-500 hover:border-blue-500 focus:bg-blue-50 dark:bg-blue-900/20",
    [ProjectType.poetry]:
      "focus:border-pink-500 hover:border-pink-500 focus:bg-pink-50 dark:bg-pink-900/20",
    [ProjectType.thesis]:
      "focus:border-purple-500 hover:border-purple-500 focus:bg-purple-50 dark:bg-purple-900/20",
    [ProjectType.illustrated]:
      "focus:border-orange-500 hover:border-orange-500 focus:bg-orange-50 dark:bg-orange-900/20",
    [ProjectType.trilogy]: "",
    [ProjectType.non_fiction]: "",
    [ProjectType.research]: "",
  };
  return (
    <Button
      className={cn(
        "cursor-pointer transition-all duration-200 border",
        typeColors[projectType],
        className,
      )}
      size="card"
      variant="none"
      {...props}
    >
      {children}
    </Button>
  );
};
export default CardProject;
