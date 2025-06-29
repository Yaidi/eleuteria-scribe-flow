import {
  GenreType,
  IChapter,
  ICharacter,
  IGeneral,
  IPlot,
  IWorld,
  PriorityType,
} from "@/types/sections.ts";
import { IProject, ProjectData, ProjectSections, ProjectType } from "@/types/project.ts";

// Mock data for ICharacter
export const mockCharacters: ICharacter[] = [
  {
    id: 1,
    name: "John Doe",
    importance: PriorityType.MAIN,
    characteristics: "Brave, intelligent, and resourceful",
    about: "The protagonist of the story, a detective with a troubled past.",
  },
  {
    id: 2,
    name: "Jane Smith",
    importance: PriorityType.SECONDARY,
    characteristics: "Clever, witty, and determined",
    about: "A journalist who helps John solve cases.",
  },
  {
    id: 3,
    name: "Robert Johnson",
    importance: PriorityType.MINOR,
    characteristics: "Mysterious, wealthy, and secretive",
    about: "A businessman with connections to the underworld.",
  },
];

// Mock data for IPlot
export const mockPlots: IPlot[] = [
  {
    id: "plot-1",
    title: "The Main Mystery",
    description: "A series of unexplained disappearances in the city.",
    manuscriptReference: "Chapters 1-5",
    characters: ["char-1", "char-2"],
  },
  {
    id: "plot-2",
    title: "The Subplot",
    description: "John's personal journey to overcome his past trauma.",
    manuscriptReference: "Throughout the book",
    characters: ["char-1"],
  },
  {
    id: "plot-3",
    title: "The Twist",
    description: "The revelation that Robert is behind the disappearances.",
    manuscriptReference: "Chapter 10",
    characters: ["char-1", "char-3"],
  },
];

// Mock data for IWorld
export const mockWorld: IWorld[] = [
  {
    id: "world-1",
    category: "Location",
    title: "Metropolis City",
    description: "A sprawling urban landscape with high crime rates and corrupt officials.",
  },
  {
    id: "world-2",
    category: "Organization",
    title: "The Syndicate",
    description: "A secret criminal organization that controls much of the city's underworld.",
  },
  {
    id: "world-3",
    category: "Item",
    title: "The Artifact",
    description: "A mysterious object that grants its owner unusual abilities.",
  },
];

// Mock data for IGeneral
export const mockGeneral: IGeneral = {
  title: "The Dark Streets",
  author: "A. Writer",
  subtitle: "A Detective's Journey",
  series: "The Metropolis Chronicles",
  volume: 1,
  genre: GenreType.Romance,
  license: "All Rights Reserved",
  situation: "",
  resumePhrase: "",
  resumeParagraph: "",
  resumePage: "",
};

// Mock data for IChapter
export const mockChapters: IChapter[] = [
  {
    id: "chap-1",
    title: "The Beginning",
    description: "John takes on a new case involving a missing person.",
    scenes: [],
  },
  {
    id: "chap-2",
    title: "The Investigation",
    description: "John and Jane follow leads across the city.",
    scenes: [],
  },
  {
    id: "chap-3",
    title: "The Revelation",
    description: "The truth behind the disappearances is revealed.",
    scenes: [],
  },
];

// Mock data for ProjectSections
export const mockProjectSections: ProjectSections = {
  wordGoal: 0,
  words: 0,
  general: mockGeneral,
  characters: mockCharacters,
  plots: mockPlots,
  world: mockWorld,
  manuscript: {
    chapters: mockChapters,
  },
};

// Mock data for IProject
export const mockProject: IProject = {
  id: 1,
  projectName: "The Dark Streets",
  type: ProjectType.NOVEL,
  projectListID: 0,
};

// Mock data for ProjectData
export const mockProjectData: ProjectData = {
  ...mockProject,
  ...mockProjectSections,
};
