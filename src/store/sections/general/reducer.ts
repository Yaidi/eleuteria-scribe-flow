import { createReducer } from "@reduxjs/toolkit";
import { updateGeneral } from "@/store/sections";
import { GenreType, IGeneral } from "@/types/sections";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";

export const initialStateGeneral: IGeneral = {
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

export const generalReducer = createReducer(initialStateGeneral, (builder) => {
  builder.addCase(updateGeneral.fulfilled, (state, { payload }) => {
    return { ...state, ...payload.general };
  });
  builder.addCase(getProjectFetch.fulfilled, (state, { payload }) => {
    return { ...state, ...payload.sections.general };
  });
  builder.addCase(addProjectFetch.fulfilled, (state, { payload }) => {
    return { ...state, ...payload.sections.general };
  });
});
