import {createAction} from "@reduxjs/toolkit";
import {ProjectData} from "@/types/project.ts";
import {ESections} from "@/types/sections.ts";

export const getCurrentProject = createAction<ProjectData>('[Project] Get Project');

export const setCurrentSection = createAction<ESections>('[Project] Set Current Section');

export const setProjectId = createAction<number>('[Main] Set Current Project id');
