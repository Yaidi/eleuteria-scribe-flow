import { Template } from "@/types/templates.ts";
import { ProjectType } from "@/types/project.ts";
import { ESections } from "@/types/sections.ts";

export const templateNovel: Template = {
  type: ProjectType.novel,
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
  type: ProjectType.poetry,
  sections: [ESections.general, ESections.manuscript, ESections.references],
  description: "Poetry collections with thematic organization",
};

export const templateThesis: Template = {
  type: ProjectType.thesis,
  sections: [ESections.general, ESections.manuscript, ESections.bibliography, ESections.resources],
  description: "Academic writing with proper citation and reference management",
};

export const templateIllustraded: Template = {
  type: ProjectType.illustrated,
  sections: [ESections.general, ESections.manuscript, ESections.illustrations, ESections.resources],
  description: "Picture books and illustrated works with visual elements",
};

export const templateTrilogy: Template = {
  type: ProjectType.trilogy,
  sections: [
    ESections.general,
    ESections.characters,
    ESections.world,
    ESections.plots,
    ESections.manuscript,
    ESections.resources,
  ],
  description: "For epic stories spanning three interconnected books",
};

export const templateNonFiction: Template = {
  type: ProjectType.non_fiction,
  sections: [ESections.general, ESections.manuscript, ESections.references, ESections.resources],
  description: "Informative works with factual content and references",
};

export const templates = [templateNovel, templateThesis];
