import { createReducer } from "@reduxjs/toolkit";
import { ProjectData, State } from "@/types/project.ts";
import { addProjectFetch, projectsFetch } from "@/store/projects/slice.ts";
import { removeProject, updateProject } from "@/store";

export interface IProjectsReducer {
  projects: ProjectData[];
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
        ...payload,
        state: State.SUCCESS,
      };
    })
    .addCase(addProjectFetch.pending, (state) => {
      return {
        ...state,
        state: State.LOADING,
      };
    })
    .addCase(addProjectFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: [...state.projects, payload],
        state: State.SUCCESS,
      };
    })
    .addCase(removeProject, (state, { payload }) => {
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== payload),
      };
    })
    .addCase(updateProject, (state, { payload }) => {
      return {
        ...state,
        projects: state.projects.map((project) => (project.id === payload.id ? payload : project)),
      };
    });
});
