import { createReducer } from "@reduxjs/toolkit";
import { IPlot } from "@/types/sections";
import { addPlot, removePlot, setCurrentPlot, updatePlot } from "@/store/sections/plots/actions.ts";
import { getProjectFetch } from "@/store";

export interface IPlotsReducer {
  plots: IPlot[];
  currentPlot: IPlot | null;
}

const initialState: IPlotsReducer = {
  plots: [],
  currentPlot: null,
};

export const plotsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getProjectFetch.fulfilled, (_state, { payload }) => {
      return {
        ..._state,
        plots: payload.sections.plots,
      };
    })
    .addCase(addPlot.fulfilled, (state, { payload }) => {
      return { ...state, plots: [...state.plots, payload], currentPlot: payload };
    })
    .addCase(setCurrentPlot, (state, { payload }) => {
      return { ...state, currentPlot: payload };
    })
    .addCase(updatePlot.fulfilled, (state, { payload }) => {
      return {
        ...state,
        plots: state.plots.map((plot) => (plot.id === payload.id ? { ...plot, ...payload } : plot)),
      };
    })
    .addCase(removePlot.fulfilled, (state, { payload }) => {
      return {
        ...state,
        plots: state.plots.filter((plot) => plot.id !== payload.id),
        currentPlot: null,
      };
    });
});
