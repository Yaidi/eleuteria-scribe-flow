import { ESections } from "@/types/sections.ts";
import React from "react";
import WorldSidebar from "@/pages/content/sidebar/WorldSidebar.tsx";
import CharactersSidebar from "@/pages/content/sidebar/CharactersSidebar.tsx";
import ManuscriptSidebar from "@/pages/content/sidebar/ManuscriptSidebar.tsx";
import PlotsSidebar from "@/pages/content/sidebar/PlotsSidebar.tsx";
import GeneralSidebar from "@/pages/content/sidebar/GeneralSidebar.tsx";

interface SidebarProps {
  activeSection: ESections;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  switch (activeSection) {
    case ESections.general:
      return <GeneralSidebar />;
    case ESections.characters:
      return <CharactersSidebar />;
    case ESections.manuscript:
      return <ManuscriptSidebar />;
    case ESections.plots:
      return <PlotsSidebar />;
    case ESections.world:
      return <WorldSidebar />;
    default:
      return <div data-testid="default"></div>;
  }
};

export default Sidebar;
