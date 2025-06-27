import {ICharacter, IGeneral, IPlot, IWorld} from "@/types/sections.ts";

export interface ProjectSections {
    wordGoal: number;
    words: number;
    general: IGeneral;
    characters: ICharacter[];
    plots: IPlot[];
    world: IWorld[];
}

export interface ProjectData extends IProject, Partial<ProjectSections> {}

export interface IProject {
    id: string;
    projectName: string
    type: ProjectType;
    title: string;
    description: string;
}

export enum ProjectType {
    NOVEL = 'Novel',
    TRILOGY = 'Trilogy',
    NON_FICTION = 'Non-fiction',
    RESEARCH = 'Research',
    POETRY = 'Poetry',
    THESIS = 'Thesis'
}
