import { createAction } from "@reduxjs/toolkit";
import { IPlot } from "@/types/sections.ts";

export const addPlot = createAction<IPlot>("[Plot] Add Product to cart");

export const updatePlot = createAction<Partial<IPlot>>("[Plot] Add Product to cart success");

export const removePlot = createAction<string>("[Plot] Remove Product to cart");
