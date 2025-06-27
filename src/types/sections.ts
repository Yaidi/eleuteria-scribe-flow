export interface ICharacter {
    id: string;
    name: string;
    importance: PriorityType;
    characteristics: string;
    about: string;
}
export enum PriorityType {
    MAIN = "Main",
    SECONDARY = "Secondary",
    MINOR = 'Minor'
}

export interface IPlot {
    id: string;
    title: string;
    description: string;
    manuscriptReference: string;
    characters: string[];
}

export interface IWorld {
    id: string;
    category: string;
    title: string;
    description: string;
}

export interface IGeneral {
    title: string;
    author: string;
    subtitle: string;
    series: string;
    volume: string;
    genre: string;
    license: string;
}

export interface IChapter {
    id: string;
    title: string;
    description: string;
}

export enum ESections {
    General= "General",
    Characters = "Characters",
    Plots = "Plots",
    World = "World",
    Manuscript = "Manuscript",
    Illustrations = "Illustrations",
    Resources = "Resources",
    References = "References",
    Bibliography = "Bibliography",
    Any = "Any"
}