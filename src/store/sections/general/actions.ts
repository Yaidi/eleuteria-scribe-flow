import { createAction } from "@reduxjs/toolkit";
import { IGeneral } from "@/types/sections.ts";

export const updateGeneral = createAction<Partial<IGeneral>>(
  "[General] Add Product to cart success",
);
