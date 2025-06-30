import { ESections } from "@/types/sections.ts";
import { ProjectType } from "@/types/project.ts";

export interface Template {
  type: ProjectType;
  sections: ESections[];
  description: string;
}

export interface Templates {
  templates: Template[];
}
