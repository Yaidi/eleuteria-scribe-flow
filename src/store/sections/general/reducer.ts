import { createReducer } from "@reduxjs/toolkit";
import { updateGeneral } from "@/store/sections";
import { GenreType, IGeneral } from "@/types/sections";

const initialState: IGeneral = {
  title: "Titulo",
  author: "",
  subtitle: "",
  series: "",
  volume: 0,
  genre: GenreType.Romance,
  license: "",
};

export const generalReducer = createReducer(initialState, (builder) => {
  builder.addCase(updateGeneral, (state, { payload }) => {
    return { ...state, ...payload };
  });
});
