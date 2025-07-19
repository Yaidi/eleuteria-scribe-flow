import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderCurrentSection } from "@/pages/sections/SwitchSections";
import { ESections } from "@/types/sections";

// Mock de los componentes
vi.mock("@/pages/sections/General", () => ({
  default: () => <div>General Section</div>,
}));
vi.mock("@/pages/sections/Characters", () => ({
  default: () => <div>Characters Section</div>,
}));
vi.mock("@/pages/sections/Plot", () => ({
  default: () => <div>Plot Section</div>,
}));
vi.mock("@/pages/sections/World", () => ({
  default: () => <div>World Section</div>,
}));
vi.mock("@/pages/sections/Manuscript", () => ({
  default: ({ section }: { section: ESections }) => <div>Manuscript Section - {section}</div>,
}));

describe("renderCurrentSection", () => {
  test("Should render <General /> when currentSection es general", () => {
    render(renderCurrentSection(ESections.general));
    expect(screen.getByText("General Section")).toBeInTheDocument();
  });

  test("Should render <Characters /> when currentSection es characters", () => {
    render(renderCurrentSection(ESections.characters));
    expect(screen.getByText("Characters Section")).toBeInTheDocument();
  });

  test("Should render <Plot /> when currentSection is plots", () => {
    render(renderCurrentSection(ESections.plots));
    expect(screen.getByText("Plot Section")).toBeInTheDocument();
  });

  test("Should render <World /> when currentSection is world", () => {
    render(renderCurrentSection(ESections.world));
    expect(screen.getByText("World Section")).toBeInTheDocument();
  });

  test("Should render <Manuscript /> when currentSection doesn't match", () => {
    render(renderCurrentSection("somethingElse" as ESections));
    expect(screen.getByText("Manuscript Section - somethingElse")).toBeInTheDocument();
  });
});
