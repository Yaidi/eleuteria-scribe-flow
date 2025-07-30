import { createReducer } from "@reduxjs/toolkit";
import { updateGeneral } from "@/store/sections";
import { GenreType, IGeneral } from "@/types/sections";
import { addProjectFetch, getProjectFetch } from "@/store/projects/slice.ts";

const initialState: IGeneral = {
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

export const generalReducer = createReducer(initialState, (builder) => {
  builder.addCase(updateGeneral.fulfilled, (state, { payload }) => {
    return { ...state, ...payload };
  });
  builder.addCase(getProjectFetch.fulfilled, (state, { payload }) => {
    return { ...state, ...payload.sections.general };
  });
  builder.addCase(addProjectFetch.fulfilled, (state, { payload }) => {
    return { ...state, ...payload.sections.general };
  });
});
