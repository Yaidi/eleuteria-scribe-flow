import { createReducer } from "@reduxjs/toolkit";
import { IPlot } from "@/types/sections";
import { addPlot, removePlot, updatePlot } from "@/store/sections/plots/actions.ts";

const initialState: IPlot[] = [];

export const plotsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addPlot, (state, { payload }) => {
      return [...state, payload];
    })
    .addCase(updatePlot, (state, { payload }) => {
      return state.map((plot) => (plot.id === payload.id ? { ...plot, payload } : plot));
    })
    .addCase(removePlot, (state, { payload }) => {
      return state.filter((plot) => plot.id !== payload);
    });
});
