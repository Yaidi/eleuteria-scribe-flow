import { describe, expect, test } from "vitest";
import { IProjectsReducer, ProjectsReducer } from "@/store/projects/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { addProjectFetch, projectsFetch } from "@/store/projects/slice.ts";
import { mockProjectData } from "../../../mocks";
import { removeProject, updateProject } from "@/store";
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
      payload: {
        projects: [mockProjectData, { ...mockProjectData, id: 2 }],
      },
    };
    const result = ProjectsReducer(initialState, action);
    expect(result.projects).toEqual([mockProjectData, { ...mockProjectData, id: 2 }]);
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
      type: removeProject.type,
      payload: mockProjectData.id,
    };
    const result = ProjectsReducer({ projects: [mockProjectData], state: State.LOADING }, action);
    expect(result.projects).toEqual([]);
    expect(result.state).toEqual(State.LOADING);
  });
  test("should handle update project", () => {
    const action: UnknownAction = {
      type: updateProject.type,
      payload: { ...mockProjectData, name: "Updated Project" },
    };
    const result = ProjectsReducer({ projects: [mockProjectData], state: State.LOADING }, action);
    expect(result.projects).toEqual([{ ...mockProjectData, name: "Updated Project" }]);
    expect(result.state).toEqual(State.LOADING);
  });
});
