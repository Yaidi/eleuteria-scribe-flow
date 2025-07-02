export interface ICharacter {
  id: number;
  name: string;
  importance: PriorityType;
  characteristics: string;
  motivation: string;
  objetive: string;
  conflict: string;
  epiphany: string;
  resumePhrase: string;
  resumeParagraph: string;
  resume: string;
  notes: string;
  details: string;
  baseWritingProjectID: number;
  plotID: number;
}
export enum PriorityType {
  MAIN,
  SECONDARY,
  MINOR,
}

export interface IPlot {
  id: string;
  title: string;
  description: string;
  manuscriptReference: string;
  characters: string[];
}

export interface IWorld {
  id: number;
  baseWritingProjectID: number;
  worldElements: IWorldElement[];
}

export interface IWorldElement {
  id: number;
  name: string;
  description: string;
  origin: string;
  conflictCause: string;
  worldElementID: number;
  worldID: number;
}

export interface IGeneral {
  author: string;
  title: string;
  subtitle: string;
  series: string;
  volume: number;
  genre: GenreType;
  license: string;
  situation: string;
  resumePhrase: string;
  resumeParagraph: string;
  resumePage: string;
}
export enum GenreType {
  Romance = "Romance",
}

export interface IChapter {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  wordGoal: number;
  characters: string[];
}

export enum ESections {
  general = "General",
  characters = "Characters",
  plots = "Plots",
  world = "World",
  manuscript = "Manuscript",
  illustrations = "Illustrations",
  resources = "Resources",
  references = "References",
  bibliography = "Bibliography",
  Any = "Any",
}
