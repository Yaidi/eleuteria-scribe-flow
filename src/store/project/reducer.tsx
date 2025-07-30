import { createReducer } from "@reduxjs/toolkit";
import { ProjectData } from "@/types/project.ts";
import { ESections } from "@/types/sections.ts";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";
import { setCurrentSection, updateGeneral, updateProjectName } from "@/store";
import { useDispatch } from "react-redux";

export interface IProjectReducer {
  currentSection: ESections;
  currentProject: ProjectData | undefined;
}

const initialState: IProjectReducer = {
  currentSection: ESections.general,
  currentProject: undefined,
};

export const ProjectReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(updateGeneral.fulfilled, (state, { payload }) => {
      const dispatch = useDispatch();
      dispatch(updateProjectName(payload.title));
      return {
        ...state,
        currentProject: { ...state.currentProject!, projectName: payload.title },
      };
    })
    .addCase(getProjectFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        currentProject: payload,
      };
    })
    .addCase(addProjectFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        currentProject: payload,
        projectId: payload.id,
      };
    })
    .addCase(setCurrentSection, (state, { payload }) => {
      return {
        ...state,
        currentSection: payload,
      };
    });
});
