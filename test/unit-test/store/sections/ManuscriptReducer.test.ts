import { describe, expect, test } from "vitest";
import { IManuscriptReducer, manuscriptReducer } from "@/store/sections/manuscript/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { addChapter, removeChapter, selectChapter, selectScene } from "@/store";
import { saveSceneSession, getManuscriptList } from "@/store/sections/manuscript/slice.ts";
import { mockChapters } from "../../../mocks";
import { Scene } from "@/types/sections";

describe("ManuscriptReducer", () => {
  const initialState: IManuscriptReducer = {
    chapters: [],
    currentChapter: undefined,
    currentScene: undefined,
    isSaving: false,
    lastSavedDate: undefined,
    error: undefined,
  };

  const mockScene: Scene = {
    path: "scene-1",
    title: "Opening Scene",
    content: "It was a dark and stormy night...",
  };

  const mockChapterWithScenes = {
    ...mockChapters[0],
    scenes: [mockScene],
  };

  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = manuscriptReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  test("should handle add chapter", () => {
    const action: UnknownAction = {
      type: addChapter.type,
      payload: mockChapterWithScenes,
    };
    const result = manuscriptReducer(initialState, action);
    expect(result.chapters).toEqual([mockChapterWithScenes]);
    expect(result.currentChapter).toEqual(mockChapterWithScenes);
    expect(result.currentScene).toEqual(mockScene);
  });

  test("should handle add chapter without scenes", () => {
    const action: UnknownAction = {
      type: addChapter.type,
      payload: mockChapters[0],
    };
    const result = manuscriptReducer(initialState, action);
    expect(result.chapters).toEqual([mockChapters[0]]);
    expect(result.currentChapter).toEqual(mockChapters[0]);
    expect(result.currentScene).toEqual(mockChapters[0].scenes[0]);
  });

  test("should handle remove chapter", () => {
    const action: UnknownAction = {
      type: removeChapter.type,
      payload: mockChapters[0].path,
    };
    const result = manuscriptReducer({ ...initialState, chapters: mockChapters }, action);
    expect(result.chapters).not.toContain(mockChapters[0]);
    expect(result.currentChapter).toBeUndefined();
    expect(result.currentScene).toBeUndefined();
  });

  test("should handle remove chapter when current chapter is removed", () => {
    const stateWithCurrentChapter = {
      ...initialState,
      chapters: mockChapters,
      currentChapter: mockChapters[0],
      currentScene: mockScene,
    };

    const action: UnknownAction = {
      type: removeChapter.type,
      payload: mockChapters[0].path,
    };

    const result = manuscriptReducer(stateWithCurrentChapter, action);
    expect(result.chapters).toHaveLength(2);
    expect(result.currentChapter).toBeUndefined();
    expect(result.currentScene).toBeUndefined();
  });

  test("should handle select chapter", () => {
    const stateWithChapters = {
      ...initialState,
      chapters: mockChapters,
      currentScene: mockScene,
    };

    const action: UnknownAction = {
      type: selectChapter.type,
      payload: mockChapters[1],
    };

    const result = manuscriptReducer(stateWithChapters, action);
    expect(result.currentChapter).toEqual(mockChapters[1]);
    expect(result.currentScene).toBeUndefined(); // should reset scene when changing chapter
  });

  test("should handle select scene", () => {
    const action: UnknownAction = {
      type: selectScene.type,
      payload: mockScene,
    };

    const result = manuscriptReducer(initialState, action);
    expect(result.currentScene).toEqual(mockScene);
    // Other state properties should remain unchanged
    expect(result.chapters).toEqual(initialState.chapters);
    expect(result.currentChapter).toEqual(initialState.currentChapter);
    expect(result.isSaving).toBe(false);
  });

  test("should handle saveSceneSession.pending", () => {
    const action: UnknownAction = {
      type: saveSceneSession.pending.type,
      payload: undefined,
    };

    const result = manuscriptReducer(initialState, action);
    expect(result.isSaving).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("should handle saveSceneSession.fulfilled", () => {
    const mockDate = new Date("2023-01-01T10:00:00.000Z");
    const stateWithSaving = {
      ...initialState,
      isSaving: true,
    };

    const action: UnknownAction = {
      type: saveSceneSession.fulfilled.type,
      payload: { lastSaved: mockDate },
    };

    const result = manuscriptReducer(stateWithSaving, action);
    expect(result.isSaving).toBe(false);
    expect(result.lastSavedDate).toEqual(mockDate);
    expect(result.error).toBeUndefined();
  });

  test("should handle saveSceneSession.rejected", () => {
    const errorMessage = "Failed to save scene";
    const stateWithSaving = {
      ...initialState,
      isSaving: true,
    };

    const action: UnknownAction = {
      type: saveSceneSession.rejected.type,
      payload: errorMessage,
    };

    const result = manuscriptReducer(stateWithSaving, action);
    expect(result.isSaving).toBe(false);
    expect(result.error).toEqual(errorMessage);
    expect(result.lastSavedDate).toBeUndefined();
  });

  test("should maintain existing state when handling saveSceneSession actions", () => {
    const existingState = {
      chapters: mockChapters,
      currentChapter: mockChapters[0],
      currentScene: mockScene,
      isSaving: false,
      lastSavedDate: new Date("2022-01-01"),
      error: undefined,
    };

    const action: UnknownAction = {
      type: saveSceneSession.pending.type,
      payload: undefined,
    };

    const result = manuscriptReducer(existingState, action);
    expect(result.chapters).toEqual(mockChapters);
    expect(result.currentChapter).toEqual(mockChapters[0]);
    expect(result.currentScene).toEqual(mockScene);
    expect(result.isSaving).toBe(true);
    expect(result.lastSavedDate).toEqual(existingState.lastSavedDate);
  });

  test("should handle multiple chapter operations", () => {
    let state = initialState;

    state = manuscriptReducer(state, {
      type: addChapter.type,
      payload: mockChapters[0],
    });

    state = manuscriptReducer(state, {
      type: addChapter.type,
      payload: mockChapters[1],
    });

    expect(state.chapters).toHaveLength(2);
    expect(state.currentChapter).toEqual(mockChapters[1]); // should be the last added

    state = manuscriptReducer(state, {
      type: removeChapter.type,
      payload: mockChapters[0].path,
    });

    expect(state.chapters).toHaveLength(1);
    expect(state.chapters[0]).toEqual(mockChapters[1]);
  });

  test("should handle getManuscriptList.pending", () => {
    const action: UnknownAction = {
      type: getManuscriptList.pending.type,
      payload: undefined,
    };

    const result = manuscriptReducer(initialState, action);
    expect(result.isSaving).toBe(false);
    expect(result.error).toBeUndefined();
  });

  test("should handle getManuscriptList.fulfilled", () => {
    const stateWithSaving = {
      ...initialState,
      isSaving: false,
    };

    const action: UnknownAction = {
      type: getManuscriptList.fulfilled.type,
      payload: { path: "path", chapters: mockChapters },
    };

    const result = manuscriptReducer(stateWithSaving, action);
    expect(result.isSaving).toBe(false);
    expect(result.chapters).toEqual(mockChapters);
    expect(result.error).toBeUndefined();
  });

  test("should handle getManuscriptList.rejected", () => {
    const errorMessage = "Failed to retrieve manuscript list";
    const stateWithSaving = {
      ...initialState,
      isSaving: false,
    };

    const action: UnknownAction = {
      type: getManuscriptList.rejected.type,
      payload: errorMessage,
    };

    const result = manuscriptReducer(stateWithSaving, action);
    expect(result.isSaving).toBe(false);
    expect(result.error).toEqual(errorMessage);
    expect(result.lastSavedDate).toBeUndefined();
  });
});
