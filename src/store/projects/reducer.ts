import { createReducer } from "@reduxjs/toolkit";
import { IProject, State } from "@/types/project.ts";
import { addProjectFetch, projectsFetch, removeProject } from "@/store/projects/slice.ts";

export interface IProjectsReducer {
  projects: IProject[];
  state: State;
}

const initialState: IProjectsReducer = {
  projects: [],
  state: State.LOADING,
};

export const ProjectsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(projectsFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: payload,
        state: State.SUCCESS,
      };
    })
    .addCase(addProjectFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: [...state.projects, payload],
        state: State.SUCCESS,
      };
    })
    .addCase(removeProject.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== payload.id),
      };
    });
});
