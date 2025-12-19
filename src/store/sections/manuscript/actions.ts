import { createAction } from "@reduxjs/toolkit";
import { IChapter, Scene } from "@/types/sections.ts";

export const selectChapter = createAction<IChapter>("Section [Manuscript] Set current chapter");

export const selectScene = createAction<Scene>("Section [Manuscript] Set current scene");

export const addChapter = createAction<IChapter>("Section [Manuscript] Add Chapter to structure");

export const addScene = createAction<Scene>("Section [Manuscript] Add new scene");

export const removeChapter = createAction<string>("Section [Manuscript] Remove Chapter");
