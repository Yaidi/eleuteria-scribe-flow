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
  projectID: number;
  plotID: number;
}

export enum PriorityType {
  MAIN,
  SECONDARY,
  MINOR,
}

export interface IPlot {
  id: number;
  projectID: number;
  title: string;
  description: string;
  plotStepsResume: string;
  plotSteps: IPlotSteps[];
  result: string;
  chapterReferences: string[];
  importance: PriorityType;
  characters: ICharacter[];
}

export interface IPlotSteps {
  id: number;
  name: string;
  nextStepID: number;
  previousStepID: number;
  goal: string;
  plotID: number;
}

export interface IWorld {
  id: number;
  projectID: number;
  worldElements: IWorldElement[];
}

export interface IWorldElement {
  id: number;
  name: string;
  description: string;
  origin: string;
  conflictCause: string;
  parentId: number | null;
  worldId: number;
}

export interface IWorldElementWithChildren extends IWorldElement {
  childrenIds: number[];
}
export type IWorldElementsObject = Record<number, IWorldElementWithChildren>;

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
  settings = "Settings",
}
