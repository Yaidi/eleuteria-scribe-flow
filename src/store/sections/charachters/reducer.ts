import { createReducer } from "@reduxjs/toolkit";
import { removeCharacter, updateInfoCharacter } from "@/store/sections";
import { ICharacter } from "@/types/sections";

const initialState: ICharacter[] = [];

export const charactersReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(removeCharacter, (state, { payload }) => {
      return state.filter((character) => character.id !== payload);
    })
    .addCase(updateInfoCharacter, (state, { payload }) => {
      return state.map((c) => (c.id === payload.id ? { ...c, ...payload } : c));
    });
});
