import { createAction } from "@reduxjs/toolkit";
import { IChapter, Scene } from "@/types/sections.ts";

export const selectChapter = createAction<IChapter>("Section [Manuscript] Set current chapter");

export const selectScene = createAction<Scene>("Section [Manuscript] Set current scene");

export const addChapter = createAction<IChapter>("Section [Manuscript] Add Chapter to structure");

export const addScene = createAction<Scene>("Section [Manuscript] Add new scene");

export const renameChapter = createAction<{ path: string; title: string }>(
  "Section [Manuscript] Rename Chapter",
);

export const renameScene = createAction<{ chapterPath: string; scenePath: string; title: string }>(
  "Section [Manuscript] Rename Scene",
);
