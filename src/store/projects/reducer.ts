import { createReducer } from "@reduxjs/toolkit";
import { ProjectData } from "@/types/project.ts";
import { projectsFetch } from "@/store/projects/slice.ts";
import { addProject, removeProject, updateProject } from "@/store";

export interface IProjectsReducer {
  projects: ProjectData[];
}

const initialState: IProjectsReducer = {
  projects: [],
};

export const ProjectsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(projectsFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    })
    .addCase(addProject, (state, { payload }) => {
      return {
        ...state,
        projects: [...state.projects, payload],
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
