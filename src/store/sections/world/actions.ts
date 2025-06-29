import { createAction } from "@reduxjs/toolkit";
import { IWorldElement } from "@/types/sections.ts";

export const addWorldElement = createAction<Partial<IWorldElement>>("[World] Add Element to World");

export const updateWorldElement = createAction<Partial<IWorldElement>>(
  "[World] Update Element to World",
);

export const removeWorldElement = createAction<number>("[World] Remove Element to World");
