import { describe, expect, test } from "vitest";
import { IPlotsReducer, plotsReducer } from "@/store/sections/plots/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { addPlot, removePlot, updatePlot } from "@/store";
import { mockPlots } from "../../../mocks";

describe("PlotsReducer", () => {
  const initialState: IPlotsReducer = {
    plots: [],
  };
  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = plotsReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  test("should handle add plot", () => {
    const action: UnknownAction = {
      type: addPlot.fulfilled.type,
      payload: mockPlots[0],
    };
    const result = plotsReducer(initialState, action);
    expect(result.plots).toEqual([mockPlots[0]]);
  });
  test("should handle update Plot", () => {
    const action: UnknownAction = {
      type: updatePlot.fulfilled.type,
      payload: { ...mockPlots[0], name: "Updated Plot" },
    };
    const result = plotsReducer({ ...initialState, plots: mockPlots }, action);
    expect(result.plots).toContainEqual({ ...mockPlots[0], name: "Updated Plot" });
  });
  test("should handle remove plot", () => {
    const action: UnknownAction = {
      type: removePlot.fulfilled.type,
      payload: { id: mockPlots[0].id },
    };
    const result = plotsReducer({ ...initialState, plots: mockPlots }, action);
    expect(result.plots).not.toContain(mockPlots[0]);
  });
});
