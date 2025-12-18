import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import CardProject from "@/pages/projects/CardProject.tsx";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import React from "react";
import { IProject } from "@/types/project.ts";
import { useTranslation } from "react-i18next";

interface ScrollAreaProjectsProps {
  filteredProjects: IProject[];
  handleProject: (project: IProject) => void;
}

const ScrollAreaProjects: React.FC<ScrollAreaProjectsProps> = ({
  filteredProjects,
  handleProject,
}) => {
  const { t } = useTranslation("project");

  return (
    <ScrollArea className="flex-2 overflow-auto mb-4 h-auto">
      {filteredProjects.map((project) => (
        <CardProject
          key={project.id}
          projectType={project.type}
          className="p-2 rounded-lg shadow-md mb-4 flex flex-col"
          onClick={() => handleProject(project)}
        >
          <CardHeader className="text-slate-800 dark:text-slate-200">
            {t("projectName", { name: project.projectName })}
            <CardDescription className="">{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-around">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 dark:text-slate-400 capitalize"
            >
              {t(`type.${project.type}`)}
            </Badge>
            <Badge
              variant="default"
              className="text-xs px-2 py-0.5 capitalize bg-white text-gray-700"
            >
              {t(`status.${project.status}`)}
            </Badge>
          </CardContent>
        </CardProject>
      ))}
    </ScrollArea>
  );
};

export default ScrollAreaProjects;
