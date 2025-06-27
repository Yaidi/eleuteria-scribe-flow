import {createReducer} from "@reduxjs/toolkit";
import {addProject} from "@/store/Projects/actions.ts";
import {ProjectData} from "@/types/project.tsx";
import {ESections} from "@/types/sections.tsx";
import {getCurrentProject, setCurrentSection} from "@/store/project/actions.ts";

export interface IProjectReducer {
    currentSection: ESections,
    currentProject: ProjectData | undefined
}


const initialState: IProjectReducer = {
    currentSection: ESections.General,
    currentProject: undefined
}

export const ProjectReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(getCurrentProject, (state, {payload}) => {
            return ({
               ...state,
               currentProject: payload
            });
        })
        .addCase(addProject, (state, {payload}) => {
            return ({
                ...state,
                currentProject: payload
            });
    }).addCase(setCurrentSection, (state, {payload}) => {
        return ({
            ...state,
            currentSection: payload
        })
    })
})