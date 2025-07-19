import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import { ESections } from "@/types/sections.ts";

export const templateNovel: Template = {
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

export const templatePoetry: Template = {
  type: ProjectType.POETRY,
  sections: [ESections.general, ESections.manuscript, ESections.references],
  description: "Poetry collections with thematic organization",
};

export const templateThesis: Template = {
  type: ProjectType.THESIS,
  sections: [ESections.general, ESections.manuscript, ESections.bibliography, ESections.resources],
  description: "Academic writing with proper citation and reference management",
};

export const templateIllustraded: Template = {
  type: ProjectType.ILLUSTRATED,
  sections: [ESections.general, ESections.manuscript, ESections.illustrations, ESections.resources],
  description: "Picture books and illustrated works with visual elements",
};

export const templates = [templateNovel, templateThesis];
