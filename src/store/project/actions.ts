import {createAction} from "@reduxjs/toolkit";
import {ProjectData} from "@/types/project.tsx";
import {ESections} from "@/types/sections.tsx";

export const getCurrentProject = createAction<ProjectData>('[Project] Get Project');

export const setCurrentSection = createAction<ESections>('[Project] Set Current Section');
