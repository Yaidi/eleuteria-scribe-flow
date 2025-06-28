import { createAction } from "@reduxjs/toolkit";
import { IWorld } from "@/types/sections.ts";

export const addWorld = createAction<IWorld>("[World] Add Element to World");

export const updateInfoWorld = createAction<Partial<IWorld>>("[World] Add Element to World");

export const removeWorld = createAction<string>("[World] Remove Element to World");
