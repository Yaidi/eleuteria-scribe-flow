import { configureStore } from "@reduxjs/toolkit";
import { ProjectsReducer } from "@/store/projects/reducer.ts";
import { ProjectReducer } from "@/store/project/reducer.tsx";
import { SectionsReducer } from "@/store/sections/sections-config.ts";

export const store = configureStore({
  reducer: {
    sections: SectionsReducer,
    projects: ProjectsReducer,
    projectInfo: ProjectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
