import { createReducer } from "@reduxjs/toolkit";
import { addChapter, removeChapter } from "@/store/sections";
import {IChapter, Scene} from "@/types/sections";

export interface IManuscriptReducer {
    chapters: IChapter[],
    currentChapter: IChapter | undefined
    currentScene: Scene | undefined
}

const initialState: IManuscriptReducer = {
    chapters: [],
    currentChapter: undefined,
    currentScene: undefined
}

export const manuscriptReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(addChapter, (state, { payload }) => {
            return {
                ...state,
                chapters: [...state.chapters, payload]
            }
        })
        .addCase(removeChapter, (state, { payload }) => {
            return {
                ...state,
                chapters: state.chapters.filter(chapter => chapter.id !== payload)
            }
        });
});