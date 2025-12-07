import { IProject } from "@/types/project.ts";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useTranslation } from "react-i18next";
import ScrollAreaProjects from "@/pages/projects/ScrollAreaProjects.tsx";

export interface SidebarProjectsProps {
  projects: IProject[];
  handleProject: (project: IProject) => void;
}
const SidebarProjects: React.FC<SidebarProjectsProps> = ({ projects, handleProject }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("projects");

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
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </header>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("search.placeholder")}
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ScrollAreaProjects filteredProjects={filteredProjects} handleProject={handleProject} />

      <Button className="mt-6" onClick={() => navigate("/template")}>
        {t("createProject")}
      </Button>
    </Sidebar>
  );
};
export default SidebarProjects;
