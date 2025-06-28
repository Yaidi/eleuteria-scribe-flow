import {IChapter, ICharacter, IGeneral, IPlot, IWorld} from "@/types/sections.ts";

export interface ProjectSections {
    wordGoal: number;
    words: number;
    general: IGeneral;
    characters: ICharacter[];
    plots: IPlot[];
    world: IWorld[];
    manuscript: {
        chapters: IChapter[]
    }
}

export interface ProjectData extends IProject, Partial<ProjectSections> {}

export interface IProject {
    id: number;
    projectName: string
    type: ProjectType;
}

export enum ProjectType {
    NOVEL = 'Novel',
    TRILOGY = 'Trilogy',
    NON_FICTION = 'Non-fiction',
    RESEARCH = 'Research',
    POETRY = 'Poetry',
    THESIS = 'Thesis',
    ILLUSTRATED = 'Illustrated'
}
