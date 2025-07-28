import { IProject } from "@/types/project.ts";
import React from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export interface ProjectProps {
  project: IProject | null;
  handleRemove: (id: number, name: string) => void;
  handleProject: (id: number) => void;
}
const Project: React.FC<ProjectProps> = ({ project, handleRemove, handleProject }) => {
  if (!project) return null;
  return (
    <div data-testid="project">
      <h1>{project.id}</h1>
      <Button onClick={() => handleProject(project.id)}>Open Project</Button>
      <button
        data-testid="btn-rm-project"
        className=""
        onClick={() => handleRemove(project.id, project.projectName)}
      >
        <Trash></Trash>
      </button>
    </div>
  );
};
export default Project;
