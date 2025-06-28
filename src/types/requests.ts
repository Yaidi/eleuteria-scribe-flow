import {ProjectType} from "@/types/project.ts";

export interface RequestAddProject {
    "projectListID": 1,
    "type": ProjectType
}

export interface RequestUpdateSection {
    "id": number,
}