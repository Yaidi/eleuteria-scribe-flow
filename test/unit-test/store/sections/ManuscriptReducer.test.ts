import { describe, expect, test } from "vitest";
import { IManuscriptReducer, manuscriptReducer } from "@/store/sections/manuscript/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { addChapter, removeChapter } from "@/store";
import { mockChapters } from "../../../mocks";

describe("ManuscriptReducer", () => {
  const initialState: IManuscriptReducer = {
    chapters: [],
    currentChapter: undefined,
    currentScene: undefined,
  };

  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = manuscriptReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  test("should handle add chapter", () => {
    const action: UnknownAction = {
      type: addChapter.type,
      payload: mockChapters[0],
    };
    const result = manuscriptReducer(initialState, action);
    expect(result.chapters).toEqual([mockChapters[0]]);
  });

  test("should handle remove chapter", () => {
    const action: UnknownAction = {
      type: removeChapter.type,
      payload: mockChapters[0].id,
    };
    const result = manuscriptReducer({ ...initialState, chapters: mockChapters }, action);
    expect(result.chapters).not.toContain(mockChapters[0]);
  });
});
