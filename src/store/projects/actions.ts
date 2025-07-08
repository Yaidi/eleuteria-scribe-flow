import { createAction } from "@reduxjs/toolkit";
import { ProjectData } from "@/types/project.ts";

export const updateProject = createAction<ProjectData>("[Projects] Update Project");

export const removeProject = createAction<number>("[Projects] Remove Project");
