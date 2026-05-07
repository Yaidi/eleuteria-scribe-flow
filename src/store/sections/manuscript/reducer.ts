import { createReducer } from "@reduxjs/toolkit";
import {
  addChapter,
  getManuscriptList,
  removeSceneOrChapter,
  renameChapter,
  renameScene,
  selectChapter,
  selectScene,
} from "@/store/sections";
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

export const initialStateManuscript: IManuscriptReducer = {
  chapters: [],
  currentChapter: undefined,
  currentScene: undefined,
  isSaving: false,
  lastSavedDate: undefined,
  error: undefined,
};

export const manuscriptReducer = createReducer(initialStateManuscript, (builder) => {
  builder
    .addCase(addChapter, (state, { payload }) => {
      return {
        ...state,
        chapters: [...state.chapters, payload],
        currentChapter: payload,
        currentScene: payload.scenes[0],
      };
    })
    .addCase(selectChapter, (state, { payload }) => {
      return {
        ...state,
        currentChapter: payload,
        currentScene: undefined,
      };
    })
    .addCase(selectScene, (state, { payload }) => {
      return {
        ...state,
        currentScene: payload,
      };
    })
    .addCase(renameChapter, (state, { payload }) => {
      return {
        ...state,
        chapters: state.chapters.map((chapter) =>
          chapter.path === payload.path ? { ...chapter, title: payload.title } : chapter,
        ),
      };
    })
    .addCase(renameScene, (state, { payload }) => {
      const updatedChapters = state.chapters.map((chapter) => {
        if (chapter.path !== payload.chapterPath) return chapter;
        return {
          ...chapter,
          scenes: chapter.scenes.map((scene) =>
            scene.path === payload.scenePath ? { ...scene, title: payload.title } : scene,
          ),
        };
      });
      const updatedCurrentScene =
        state.currentScene?.path === payload.scenePath
          ? { ...state.currentScene, title: payload.title }
          : state.currentScene;
      return {
        ...state,
        chapters: updatedChapters,
        currentScene: updatedCurrentScene,
      };
    })
    .addCase(removeSceneOrChapter.fulfilled, (state, { payload }) => {
      const chapter = state.chapters.find((c) => c.path === payload.path);
      if (!chapter) return state;

      // If last scene, remove the entire chapter
      if (chapter.scenes.length <= 1) {
        return {
          ...state,
          chapters: state.chapters.filter((c) => c.path !== payload.path),
          currentChapter:
            state.currentChapter?.path === payload.path ? undefined : state.currentChapter,
          currentScene: state.currentScene?.path === payload.path ? undefined : state.currentScene,
        };
      }

      return {
        ...state,
        chapters: state.chapters.map((c) => {
          if (c.path !== payload.path) return c;
          return { ...c, scenes: c.scenes.filter((s) => s.path !== payload.path) };
        }),
        currentScene: state.currentScene?.path === payload.path ? undefined : state.currentScene,
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
    })
    .addCase(getManuscriptList.pending, (state) => {
      return {
        ...state,
        isSaving: false,
      };
    })
    .addCase(getManuscriptList.fulfilled, (state, { payload }) => {
      return {
        ...state,
        isSaving: false,
        chapters: payload.chapters,
      };
    })
    .addCase(getManuscriptList.rejected, (state, { payload }) => {
      return {
        ...state,
        isSaving: false,
        error: payload,
      };
    });
});
