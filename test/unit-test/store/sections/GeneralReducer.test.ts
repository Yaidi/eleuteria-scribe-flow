import { describe, expect, test } from "vitest";
import { GenreType, IGeneral } from "@/types/sections.ts";
import { generalReducer } from "@/store/sections/general/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { updateGeneral } from "@/store";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";
import { mockProjectData } from "../../../mocks";

describe("GeneralReducer", () => {
  const initialState: IGeneral = {
    title: "",
    author: "",
    subtitle: "",
    series: "",
    volume: 0,
    genre: GenreType.Romance,
    license: "",
    situation: "",
    resumePhrase: "",
    resumeParagraph: "",
    resumePage: "",
  };

  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = generalReducer(initialState, action);
    expect(result).toEqual(initialState);
  });
  test("should handle update general", () => {
    const action: UnknownAction = {
      type: updateGeneral.fulfilled.type,
      payload: {
        title: "Updated Title",
      },
    };
    const result = generalReducer(initialState, action);
    expect(result).toEqual({
      ...initialState,
      title: "Updated Title",
    });
  });
  test("should field info", () => {
    const action: UnknownAction = {
      type: getProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = generalReducer(initialState, action);
    expect(result).toEqual({
      ...initialState,
      ...mockProjectData.sections.general,
    });
  });

  test("should field info", () => {
    const action: UnknownAction = {
      type: addProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = generalReducer(initialState, action);
    expect(result).toEqual({
      ...initialState,
      ...mockProjectData.sections.general,
    });
  });
});
