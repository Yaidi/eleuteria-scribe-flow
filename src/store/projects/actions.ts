import { createAction } from "@reduxjs/toolkit";
import { ProjectData } from "@/types/project.ts";

export const addProject = createAction<ProjectData>("[Projects] Add Project");

export const updateProject = createAction<ProjectData>("[Projects] Update Project");

export const removeProject = createAction<number>("[Projects] Remove Project");

export const getProjects = createAction("[Projects] Get Project");
