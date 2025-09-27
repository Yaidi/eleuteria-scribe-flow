import { IProject } from "@/types/project.ts";
import React, { useState } from "react";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import Sidebar from "@/components/Sidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import CardProject from "@/pages/projects/CardProject.tsx";

export interface SidebarProjectsProps {
  projects: IProject[];
  handleProject: (project: IProject) => void;
}
const SidebarProjects: React.FC<SidebarProjectsProps> = ({ projects, handleProject }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const filteredProjects = projects.filter((project) => {
    if (search === "") return true;
    if (
      project.type.toLowerCase().includes(search.toLowerCase()) ||
      project.projectName.toLowerCase().includes(search.toLowerCase()) ||
      project.status.toLowerCase().includes(search.toLowerCase())
    ) {
      return true;
    }
  });

  return (
    <Sidebar className="min-w-40">
      <header className="flex flex-col items-center justify-items-end mb-4">
        <BookOpen />
        <h1 className="text-2xl font-bold">Projects</h1>
      </header>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-2 overflow-auto mb-4 h-auto">
        {filteredProjects.map((project) => (
          <CardProject
            key={project.id}
            projectType={project.type}
            className="p-2 rounded-lg shadow-md mb-4 flex flex-col"
            onClick={() => handleProject(project)}
          >
            <CardHeader className="text-slate-800 dark:text-slate-200">
              Project: {project.projectName}
              <CardDescription className="">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-around">
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 dark:text-slate-400 capitalize"
              >
                {project.type}
              </Badge>
              <Badge
                variant="default"
                className="text-xs px-2 py-0.5 capitalize bg-white text-gray-700"
              >
                {project.status}
              </Badge>
            </CardContent>
          </CardProject>
        ))}
      </ScrollArea>
      <Button className="mt-6" onClick={() => navigate("/template")}>
        Create a new project
      </Button>
    </Sidebar>
  );
};
export default SidebarProjects;
