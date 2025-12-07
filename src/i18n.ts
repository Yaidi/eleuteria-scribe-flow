import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../public/locales/en/translation.json";
import enSections from "../public/locales/en/sections.json";

import esTranslation from "../public/locales/es/translation.json";
import esSections from "../public/locales/es/sections.json";
import esCharacters from "../public/locales/es/characters.json";
import enCharacters from "../public/locales/en/characters.json";
import enProjects from "../public/locales/en/projects.json";
import esProjects from "../public/locales/es/projects.json";
import enProject from "../public/locales/en/project.json";
import esProject from "../public/locales/es/project.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
      sections: enSections,
      characters: enCharacters,
      projects: enProjects,
      project: enProject,
    },
    es: {
      translation: esTranslation,
      sections: esSections,
      characters: esCharacters,
      projects: esProjects,
      project: esProject,
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
