import { describe, expect, test } from "vitest";
import { IProjectsReducer, ProjectsReducer } from "@/store/projects/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { addProjectFetch, projectsFetch, removeProject } from "@/store/projects/slice.ts";
import { mockProject, mockProjectData } from "../../../mocks";
import { State } from "@/types/project.ts";

describe("ProjectsReducer", () => {
  const initialState: IProjectsReducer = {
    projects: [],
    state: State.LOADING,
  };

  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = ProjectsReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  test("should handle get all projects", () => {
    const action: UnknownAction = {
      type: projectsFetch.fulfilled.type,
      payload: [mockProject],
    };
    const result = ProjectsReducer(initialState, action);
    expect(result.projects).toEqual([mockProject]);
    expect(result.state).toEqual(State.SUCCESS);
  });

  test("should handle add project", () => {
    const action: UnknownAction = {
      type: addProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = ProjectsReducer(initialState, action);
    expect(result.projects).toEqual([mockProjectData]);
    expect(result.state).toEqual(State.SUCCESS);
  });
  test("should handle remove project", () => {
    const action: UnknownAction = {
      type: removeProject.fulfilled.type,
      payload: { id: mockProject.id },
    };
    const result = ProjectsReducer({ projects: [mockProject], state: State.SUCCESS }, action);
    expect(result.projects).toEqual([]);
    expect(result.state).toEqual(State.SUCCESS);
  });
});
