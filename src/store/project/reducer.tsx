import {createReducer} from "@reduxjs/toolkit";
import {ProjectData} from "@/types/project.tsx";
import {ESections} from "@/types/sections.ts";
import {getCurrentProject, setCurrentSection} from "@/store/project/actions.ts";
import {addProjectFetch} from "@/store/Projects/slice.ts";

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
        .addCase(addProjectFetch.fulfilled, (state, {payload}) => {
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