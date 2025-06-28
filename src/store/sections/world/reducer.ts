import { createReducer } from "@reduxjs/toolkit";
import { addWorld, removeWorld } from "@/store/sections";
import { IWorld } from "@/types/sections";

const initialState: IWorld[] = [];

export const worldReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addWorld, (state, { payload }) => {
      state.push(payload);
    })
    .addCase(removeWorld, (state, { payload }) => {
      return state.filter((w) => w.id !== payload);
    });
});
