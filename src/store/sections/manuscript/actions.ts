import {createAction} from "@reduxjs/toolkit";
import {IChapter, Scene} from "@/types/sections.ts";

export const selectChapter = createAction<IChapter>('[Manuscript] Set current chapter');

export const selectScene = createAction<Scene>('[Manuscript] Set current scene');

export const addChapter = createAction<IChapter>('[Manuscript] Add Chapter to cart');

export const updateChapter = createAction<IChapter>('[Manuscript] Update Chapter');

export const removeChapter = createAction<string>('[Manuscript] Remove Chapter');
