import { ESections } from "@/types/sections.ts";
import React from "react";
import WorldSidebar from "@/pages/content/sidebar/WorldSidebar.tsx";
import CharactersSidebar from "@/pages/content/sidebar/CharactersSidebar.tsx";
import ManuscriptSidebar from "@/pages/content/sidebar/ManuscriptSidebar.tsx";
import PlotsSidebar from "@/pages/content/sidebar/PlotsSidebar.tsx";

interface SidebarProps {
  activeSection: ESections;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

  const createNewChapter = () => {
    // Generar IDs únicos
    const newChapterId = `chapter-${Date.now()}`;
    const newSceneId = `scene-${Date.now()}`;

    // Crear una nueva escena vacía
    const newScene: Scene = {
      id: newSceneId,
      title: `Nueva Escena 1`,
      content: "",
      wordCount: 0,
      wordGoal: 0,
      characters: [],
    };

    // Crear el nuevo capítulo con la escena incluida
    const newChapter: IChapter = {
      id: newChapterId,
      title: `Nuevo Capítulo ${manuscript.chapters.length + 1}`,
      description: "",
      scenes: [newScene],
    };

    dispatch(addChapter(newChapter));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    );
  };

  switch (activeSection) {
    case ESections.characters:
      return <CharactersSidebar />;
    case ESections.manuscript:
      return <ManuscriptSidebar />;
    case ESections.plots:
      return <PlotsSidebar />;
    case ESections.world:
      return <WorldSidebar></WorldSidebar>;
    default:
      return <div data-testid="default"></div>;
  }
};

export default Sidebar;
