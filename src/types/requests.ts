import { ProjectData, ProjectType } from "@/types/project.ts";
import { ICharacter } from "@/types/sections.ts";

export interface RequestAddProject {
  projectListID: 1;
  type: ProjectType;
}

export interface RequestUpdateSection {
  id: number;
}

export interface RequestUpdateCharacter {
  id: number;
  info: Partial<ICharacter>;
}

export interface ResponseProjects {
  projects: ProjectData[];
}

export interface ResponseId {
  id: number;
}
