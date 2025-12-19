import { createReducer } from "@reduxjs/toolkit";
import { IProject, State } from "@/types/project.ts";
import { ESections } from "@/types/sections.ts";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";
import { setCurrentSection, updateGeneral } from "@/store";
import {
  initialSectionsState,
  ISectionsReducer,
  sectionsReducer,
} from "@/store/sections/sections-config.ts";

export interface IProjectReducer {
  currentSection: ESections;
  currentProject?: IProject;
  sections: ISectionsReducer;
  status?: State;
}

const initialState: IProjectReducer = {
  currentSection: ESections.general,
  currentProject: undefined,
  sections: initialSectionsState,
  status: State.LOADING,
};

export const ProjectReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getProjectFetch.fulfilled, (state, action) => {
      const { payload } = action;
      return {
        ...state,
        status: State.SUCCESS,
        currentProject: {
          id: payload.id,
          projectListID: payload.projectListID,
          projectName: payload.projectName,
          type: payload.type,
          status: payload.status,
          description: payload.description,
          created: payload.created,
          updated: payload.updated,
          wordGoal: payload.wordGoal,
          words: payload.words,
        },
        sections: sectionsReducer(state.sections, action),
      };
    })
    .addCase(addProjectFetch.fulfilled, (state, action) => {
      const { payload } = action;

      return {
        ...state,
        status: State.SUCCESS,
        currentProject: {
          id: payload.id,
          projectListID: payload.projectListID,
          projectName: payload.projectName,
          type: payload.type,
          status: payload.status,
          description: payload.description,
          created: payload.created,
          updated: payload.updated,
          wordGoal: payload.wordGoal,
          words: payload.words,
        },
        sections: sectionsReducer(state.sections, action),
      };
    })
    .addCase(updateGeneral.fulfilled, (state, { payload }) => {
      return {
        ...state,
        currentProject: { ...state.currentProject!, projectName: payload.projectName },
      };
    })
    .addCase(setCurrentSection, (state, { payload }) => {
      return {
        ...state,
        currentSection: payload,
      };
    })
    .addMatcher(
      (action) => action.type.startsWith("Section"),
      (state, action) => {
        state.sections = sectionsReducer(state.sections, action);
      },
    );
});
