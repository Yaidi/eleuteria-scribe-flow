import { vi, beforeAll } from "vitest";
import "@testing-library/jest-dom";
import i18next from "i18next";
import enTranslation from "../public/locales/en/translation.json";
import enSections from "../public/locales/en/sections.json";
import enCharacters from "../public/locales/en/characters.json";
import enProjects from "../public/locales/en/projects.json";
import enProject from "../public/locales/en/project.json";

i18next.init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: enTranslation,
      sections: enSections,
      characters: enCharacters,
      projects: enProjects,
      project: enProject,
    },
  },
  interpolation: { escapeValue: false },
});

vi.mock("react-i18next", () => {
  return {
    useTranslation: (ns = "translation") => ({
      t: (key: string, opts?: never) => i18next.t(`${ns}:${key}`, opts),
      i18n: i18next,
    }),
    Trans: ({ children }: never) => children,
  };
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
