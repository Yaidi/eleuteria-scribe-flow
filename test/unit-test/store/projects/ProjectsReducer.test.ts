import { describe, expect, test } from "vitest";
import { IProjectsReducer, ProjectsReducer } from "@/store/projects/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { addProjectFetch, projectsFetch, removeProject } from "@/store/projects/slice.ts";
import { mockProject, mockProjectData } from "../../../mocks";
import { State } from "@/types/project.ts";
import { updateGeneral } from "@/store";

describe("ProjectsReducer", () => {
  const initialState: IProjectsReducer = {
    projects: [],
    status: State.LOADING,
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
    expect(result.status).toEqual(State.SUCCESS);
  });

  test("should handle add project", () => {
    const action: UnknownAction = {
      type: addProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = ProjectsReducer(initialState, action);
    expect(result.projects).toEqual([mockProjectData]);
    expect(result.status).toEqual(State.SUCCESS);
  });
  test("should handle remove project", () => {
    const action: UnknownAction = {
      type: removeProject.fulfilled.type,
      payload: { id: mockProject.id },
    };
    const result = ProjectsReducer({ projects: [mockProject], status: State.SUCCESS }, action);
    expect(result.projects).toEqual([]);
    expect(result.status).toEqual(State.SUCCESS);
  });
  test("should handle updateGeneral", () => {
    const action: UnknownAction = {
      type: updateGeneral.fulfilled.type,
      payload: {
        projectName: "New Name",
        projectId: 1,
      },
    };
    const result = ProjectsReducer({ projects: [mockProject], status: State.SUCCESS }, action);
    expect(result.projects[0].projectName).eq("New Name");
  });
});
