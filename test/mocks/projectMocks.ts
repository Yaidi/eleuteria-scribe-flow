import {
  GenreType,
  IChapter,
  ICharacter,
  IGeneral,
  IPlot,
  IWorld,
  IWorldElement,
  PriorityType,
} from "@/types/sections";
import { IProject, ProjectData, ProjectSections, ProjectType, Status } from "@/types/project.ts";

// Mock data for ICharacter
export const mockCharacters: ICharacter[] = [
  {
    id: 1,
    name: "John Doe",
    importance: PriorityType.MAIN,
    characteristics: "Brave, intelligent, and resourceful",
    motivation: "",
    objetive: "",
    conflict: "",
    epiphany: "",
    resumePhrase: "",
    resumeParagraph: "",
    resume: "",
    notes: "",
    details: "",
    projectID: 0,
    plotID: 0,
  },
  {
    id: 2,
    name: "Jane Smith",
    importance: PriorityType.SECONDARY,
    characteristics: "Clever, witty, and determined",
    motivation: "",
    objetive: "",
    conflict: "",
    epiphany: "",
    resumePhrase: "",
    resumeParagraph: "",
    resume: "",
    notes: "",
    details: "",
    projectID: 0,
    plotID: 0,
  },
  {
    id: 3,
    name: "Robert Johnson",
    importance: PriorityType.MINOR,
    characteristics: "Mysterious, wealthy, and secretive",
    motivation: "",
    objetive: "",
    conflict: "",
    epiphany: "",
    resumePhrase: "",
    resumeParagraph: "",
    resume: "",
    notes: "",
    details: "",
    projectID: 0,
    plotID: 0,
  },
];

// Mock data for IPlot
export const mockPlots: IPlot[] = [
  {
    id: "plot-1",
    title: "The Main Mystery",
    description: "A series of unexplained disappearances in the city.",
    plotStepsResume: "Chapters 1-5",
    characters: mockCharacters,
    projectID: 0,
    plotSteps: [],
    result: "",
    chapterReferences: [],
    importance: PriorityType.MAIN,
  },
  {
    id: "plot-2",
    title: "The Subplot",
    description: "John's personal journey to overcome his past trauma.",
    plotStepsResume: "Chapters 6-9",
    characters: mockCharacters,
    projectID: 0,
    plotSteps: [],
    result: "",
    chapterReferences: [],
    importance: PriorityType.SECONDARY,
  },
  {
    id: "plot-3",
    title: "The Twist",
    description: "The revelation that Robert is behind the disappearances.",
    plotStepsResume: "Chapter 10",
    characters: mockCharacters,
    projectID: 0,
    plotSteps: [],
    result: "",
    chapterReferences: [],
    importance: PriorityType.SECONDARY,
  },
];
// Mock data for IWorldElement
export const mockWorldElements: IWorldElement[] = [
  {
    id: 1,
    name: "The City",
    description: "A sprawling metropolis filled with secrets and shadows.",
    worldID: 0,
    origin: "",
    conflictCause: "",
    worldElementID: 0,
  },
  {
    id: 2,
    name: "The Police Station",
    description: "Where John works as a detective.",
    worldID: 0,
    origin: "",
    conflictCause: "",
    worldElementID: 0,
  },
  {
    id: 3,
    name: "The Dark Alley",
    description: "A dangerous part of the city where many disappearances have occurred.",
    worldID: 0,
    origin: "",
    conflictCause: "",
    worldElementID: 0,
  },
];

// Mock data for IWorld
export const mockWorld: IWorld = {
  id: 0,
  projectID: 0,
  worldElements: mockWorldElements,
};

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
  type: ProjectType.novel,
  projectListID: 0,
  status: Status.planning,
  description: "",
  created: "2025-07-29T09:52:08.710677",
  updated: "2025-07-29T09:52:08.710677",
  wordGoal: 0,
  words: 0,
};

export const mockProjectData: ProjectData = { ...mockProject, sections: mockProjectSections };
