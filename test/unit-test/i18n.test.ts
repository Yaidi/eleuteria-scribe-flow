import { describe, expect, test, vi } from "vitest";
import i18n from "@/localizations/i18n.ts";

vi.unmock("react-i18next");

describe("i18n configuration", () => {
  test("loads languages and namespaces", () => {
    expect(i18n.options.resources).toBeDefined();
    expect(i18n.options.resources!.en).toBeDefined();
    expect(i18n.options.resources!.es).toBeDefined();

    expect(i18n.options.ns).toContain("translation");
    expect(i18n.options.ns).toContain("sections");
  });

  test("has expected keys in English", () => {
    const t = i18n.getFixedT("en");

    expect(t("project:projectName", { name: "Test" })).toBe("Project: Test");
    expect(t("sections:general")).toBeDefined();
  });

  test("has expected keys in Spanish", () => {
    const t = i18n.getFixedT("es");

    expect(t("project:projectName", { name: "Test" })).toBe("Proyecto: Test");

    expect(t("sections:general")).toBeDefined();
  });

  test("handles missing keys gracefully", () => {
    const t = i18n.getFixedT("es");

    expect(t("sections:this_key_does_not_exist")).toBe("this_key_does_not_exist");
  });
});
