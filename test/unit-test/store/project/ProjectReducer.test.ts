import { describe, expect, it } from "vitest";
import { UnknownAction } from "@reduxjs/toolkit";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";
import { mockProjectData } from "../../../mocks";
import { IProjectReducer, ProjectReducer } from "@/store/project/reducer.tsx";
import { ESections } from "@/types/sections.ts";
import { setCurrentSection, updateGeneral } from "@/store";

describe("ProjectReducer", () => {
  const initialState: IProjectReducer = {
    currentSection: ESections.general,
    currentProject: undefined,
  };

  it("should return the initial state when passed an undefined state", () => {
    const action: UnknownAction = { type: "" };
    const result = ProjectReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  it("should set current project", () => {
    const action: UnknownAction = {
      type: getProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = ProjectReducer(initialState, action);
    expect(result.currentProject).toEqual(mockProjectData);
  });

  it("should add project and set current project", () => {
    const action: UnknownAction = {
      type: addProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = ProjectReducer(initialState, action);
    expect(result.currentProject).toEqual(mockProjectData);
  });
  it("should set current section", () => {
    const action: UnknownAction = {
      type: setCurrentSection.type,
      payload: ESections.world,
    };
    const result = ProjectReducer(initialState, action);
    expect(result.currentSection).toEqual(ESections.world);
  });
  it("should set Project name when Update Generall success is trigger", () => {
    const action: UnknownAction = {
      type: updateGeneral.fulfilled.type,
      payload: {
        projectName: "New Name",
        projectId: 1,
      },
    };
    const result = ProjectReducer({ ...initialState, currentProject: mockProjectData }, action);
    expect(result.currentProject?.projectName).eq("New Name");
  });
});
