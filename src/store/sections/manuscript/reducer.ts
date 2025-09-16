import { createReducer } from "@reduxjs/toolkit";
import { addChapter, removeChapter, selectChapter, selectScene } from "@/store/sections";
import { IChapter, Scene } from "@/types/sections";
import { saveSceneSession } from "@/store/sections/manuscript/slice.ts";

export interface IManuscriptReducer {
  chapters: IChapter[];
  currentChapter: IChapter | undefined;
  currentScene: Scene | undefined;
  isSaving: boolean;
  lastSavedDate: Date | undefined;
  error: string | undefined;
}

const initialState: IManuscriptReducer = {
  chapters: [],
  currentChapter: undefined,
  currentScene: undefined,
  isSaving: false,
  lastSavedDate: undefined,
  error: undefined,
};

export const manuscriptReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addChapter, (state, { payload }) => {
      return {
        ...state,
        chapters: [...state.chapters, payload],
        currentChapter: payload,
        currentScene: payload.scenes[0],
      };
    })
    .addCase(removeChapter, (state, { payload }) => {
      return {
        ...state,
        chapters: state.chapters.filter((chapter) => chapter.id !== payload),
        currentChapter: undefined,
        currentScene: undefined,
      };
    })
    .addCase(selectChapter, (state, { payload }) => {
      return {
        ...state,
        currentChapter: payload,
        currentScene: undefined, // al cambiar de capítulo reiniciamos la escena
      };
    })
    .addCase(selectScene, (state, { payload }) => {
      return {
        ...state,
        currentScene: payload,
      };
    })
    .addCase(saveSceneSession.pending, (state) => {
      return {
        ...state,
        isSaving: true,
      };
    })
    .addCase(saveSceneSession.fulfilled, (state, { payload }) => {
      return {
        ...state,
        isSaving: false,
        lastSavedDate: payload.lastSaved,
      };
    })
    .addCase(saveSceneSession.rejected, (state, { payload }) => {
      return {
        ...state,
        isSaving: false,
        error: payload,
      };
    });
});
