import { createReducer } from "@reduxjs/toolkit";
import { IProject, State } from "@/types/project.ts";
import { addProjectFetch, projectsFetch, removeProject } from "@/store/projects/slice.ts";
import { updateGeneral } from "@/store";

export interface IProjectsReducer {
  projects: IProject[];
  status: State;
}

const initialState: IProjectsReducer = {
  projects: [],
  status: State.LOADING,
};

export const ProjectsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(projectsFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: payload,
        status: State.SUCCESS,
      };
    })
    .addCase(addProjectFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: [...state.projects, payload],
        status: State.SUCCESS,
      };
    })
    .addCase(updateGeneral.fulfilled, (state, { payload }) => {
      const project = state.projects.find((p) => {
        return p.id === payload.projectId;
      });
      if (project) {
        project.projectName = payload.projectName;
      }
    })
    .addCase(removeProject.fulfilled, (state, { payload }) => {
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== payload.id),
      };
    });
});
