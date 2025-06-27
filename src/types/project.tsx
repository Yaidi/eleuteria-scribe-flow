import {ICharacter, IGeneral, IPlot, IWorld} from "@/types/sections.tsx";

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
}

export enum ProjectType {
    NOVEL = 'Novel',
    SHORT_STORY = 'Short-story',
    TRILOGY = 'Trilogy',
    NON_FICTION = 'Non-fiction',
    RESEARCH = 'Research',
    POETRY = 'Poetry'
}
