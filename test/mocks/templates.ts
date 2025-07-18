import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import { ESections } from "@/types/sections.ts";

const templateNovel: Template = {
  type: ProjectType.NOVEL,
  sections: [
    ESections.general,
    ESections.characters,
    ESections.world,
    ESections.plots,
    ESections.manuscript,
    ESections.resources,
  ],
  description: "Perfect for long-form fiction with complex characters and world-building",
};

const templateThesis: Template = {
  type: ProjectType.THESIS,
  sections: [ESections.general, ESections.manuscript, ESections.bibliography, ESections.resources],
  description: "Academic writing with proper citation and reference management",
};

export const templates = [templateNovel, templateThesis];
