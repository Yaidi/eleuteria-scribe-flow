import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { ProjectsReducer } from "@/store/projects/reducer.ts";
import { ProjectReducer } from "@/store/project/reducer.tsx";
import { SectionsReducer } from "@/store/sections/sections-config.ts";

export const rootReducer = combineReducers({
  sections: SectionsReducer,
  projects: ProjectsReducer,
  projectInfo: ProjectReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
