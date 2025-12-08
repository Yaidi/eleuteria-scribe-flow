import { vi, beforeAll } from "vitest";
import "@testing-library/jest-dom";
import i18next from "i18next";
import { en } from "@/localizations/english.ts";

i18next.init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      ...en,
    },
  },
  interpolation: { escapeValue: false },
});

vi.mock("react-i18next", () => {
  return {
    useTranslation: (ns = "translation") => ({
      t: (key: string, opts?: never) => {
        const hasNs = key.includes(":");
        const finalKey = hasNs ? key : `${ns}:${key}`;
        return i18next.t(finalKey, opts);
      },
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
