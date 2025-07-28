import { IProject } from "@/types/project.ts";
import React from "react";
import { Card, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import Sidebar from "@/components/Sidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { HoverCard } from "@/components/ui/hover-card.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

export interface SidebarProjectsProps {
  projects: IProject[];
  handleProject: (project: IProject) => void;
}
const SidebarProjects: React.FC<SidebarProjectsProps> = ({ projects, handleProject }) => {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-9" />
      </div>
      <ScrollArea className="flex-4 overflow-auto mb-4 h-3/5">
        {projects.map((project) => (
          <HoverCard key={project.id}>
            <Card
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-4 w-full max-w-md flex justify-between"
              onClick={() => handleProject(project)}
            >
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Project: {project.projectName}
              </CardTitle>
              <Badge className="text-sm dark:text-slate-400">{project.type}</Badge>
            </Card>
          </HoverCard>
        ))}
      </ScrollArea>
      <Button className="mt-6" onClick={() => navigate("/template")}>
        Create a new project
      </Button>
    </Sidebar>
  );
};
export default SidebarProjects;
