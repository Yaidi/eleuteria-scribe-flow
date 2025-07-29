import { createAction } from "@reduxjs/toolkit";
import { ESections } from "@/types/sections.ts";

export const setCurrentSection = createAction<ESections>("[Project] Set Current Section");

export const updateProjectName = createAction<string>("[Project] Update ProjectName");
