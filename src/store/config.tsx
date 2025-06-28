import {configureStore} from "@reduxjs/toolkit";
import {SectionsReducer} from "@/store/sections/reducer.ts";
import {ProjectsReducer} from "@/store/projects/reducer.ts";
import {ProjectReducer} from "@/store/project/reducer.tsx";

export const store = configureStore({
    reducer: {
        sections: SectionsReducer,
        projects: ProjectsReducer,
        projectInfo: ProjectReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch