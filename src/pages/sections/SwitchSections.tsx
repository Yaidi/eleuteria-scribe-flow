import { ESections } from "@/types/sections.ts";
import General from "@/pages/sections/General.tsx";
import Characters from "@/pages/sections/Characters.tsx";
import Plot from "@/pages/sections/Plot.tsx";
import World from "@/pages/sections/World.tsx";
import Manuscript from "@/pages/sections/Manuscript.tsx";
import Settings from "@/pages/Settings.tsx";

export const renderCurrentSection = (currentSection: ESections) => {
  switch (currentSection) {
    case ESections.general:
      return <General />;
    case ESections.characters:
      return <Characters />;
    case ESections.plots:
      return <Plot />;
    case ESections.world:
      return <World />;
    case ESections.settings:
      return <Settings />;
    default:
      return <Manuscript section={currentSection} />;
  }
};
