import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import esTranslation from "../../public/locales/es/translation.json";
import esSections from "../../public/locales/es/sections.json";
import esCharacters from "../../public/locales/es/characters.json";
import esProjects from "../../public/locales/es/projects.json";
import esProject from "../../public/locales/es/project.json";
import esTemplates from "../../public/locales/es/templates.json";
import esWorld from "../../public/locales/es/world.json";
import esPlots from "../../public/locales/es/plots.json";
import esManuscript from "../../public/locales/es/manuscript.json";
import esGeneral from "../../public/locales/es/general.json";
import { en } from "@/localizations/english.ts";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      ...en,
    },
    es: {
      translation: esTranslation,
      sections: esSections,
      characters: esCharacters,
      projects: esProjects,
      project: esProject,
      templates: esTemplates,
      world: esWorld,
      plots: esPlots,
      manuscript: esManuscript,
      general: esGeneral,
    },
  },
  lng: "es",
  fallbackLng: "es",
  ns: ["translation", "sections"],
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
