import { createReducer } from "@reduxjs/toolkit";
import { updateGeneral } from "@/store/sections";
import { GenreType, IGeneral } from "@/types/sections";

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
  builder.addCase(updateGeneral, (state, { payload }) => {
    return { ...state, ...payload };
  });
});
