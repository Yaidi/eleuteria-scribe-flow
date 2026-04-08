import { createReducer } from "@reduxjs/toolkit";
import { setCurrentGeneral, updateGeneral } from "@/store/sections";
import { GeneralSections, GenreType, IGeneral } from "@/types/sections";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";

export interface GeneralState {
  general: IGeneral;
  currentGeneralSection: GeneralSections;
}

export const initialStateGeneral: GeneralState = {
  general: {
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
  },
  currentGeneralSection: GeneralSections.bookInfo,
};

export const generalReducer = createReducer(initialStateGeneral, (builder) => {
  builder
    .addCase(updateGeneral.fulfilled, (state, { payload }) => {
      return { ...state, general: { ...state.general, ...payload.general } };
    })
    .addCase(getProjectFetch.fulfilled, (state, { payload }) => {
      return { ...state, general: payload.sections.general };
    })
    .addCase(addProjectFetch.fulfilled, (state, { payload }) => {
      return { ...state, general: payload.sections.general };
    })
    .addCase(setCurrentGeneral, (state, { payload }) => {
      return { ...state, currentGeneralSection: payload };
    });
});
