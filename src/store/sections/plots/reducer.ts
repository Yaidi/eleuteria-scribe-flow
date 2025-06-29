import { createReducer } from "@reduxjs/toolkit";
import { IPlot } from "@/types/sections";
import { addPlot, removePlot, updatePlot } from "@/store/sections/plots/actions.ts";

export interface IPlotsReducer {
  plots: IPlot[];
}

const initialState: IPlotsReducer = {
  plots: [],
};

export const plotsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addPlot, (state, { payload }) => {
      return { ...state, plots: [...state.plots, payload] };
    })
    .addCase(updatePlot, (state, { payload }) => {
      return {
        ...state,
        plots: state.plots.map((plot) => (plot.id === payload.id ? { ...plot, ...payload } : plot)),
      };
    })
    .addCase(removePlot, (state, { payload }) => {
      return {
        ...state,
        plots: state.plots.filter((plot) => plot.id !== payload),
      };
    });
});
