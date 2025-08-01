import { IChapter, ICharacter, IGeneral, IPlot, IWorld } from "@/types/sections.ts";

export enum State {
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
}

export enum Status {
  planning = "planning",
  writing = "writing",
  editing = "editing",
  completed = "completed",
}

export interface ProjectSections {
  general: IGeneral;
  world: IWorld;
  characters: ICharacter[];
  plots: IPlot[];
  manuscript: {
    chapters: IChapter[];
  };
}

export interface ProjectData extends IProject {
  sections: ProjectSections;
}

export interface IProject {
  id: number;
  projectListID: number;
  projectName: string;
  type: ProjectType;
  status: Status;
  description: string;
  created: string;
  updated: string;
  wordGoal: number;
  words: number;
}

export enum ProjectType {
  novel = "novel",
  trilogy = "trilogy",
  non_fiction = "non-fiction",
  thesis = "thesis",
  research = "research",
  poetry = "poetry",
  illustrated = "illustrated",
}
