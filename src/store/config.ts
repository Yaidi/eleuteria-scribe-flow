import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { ProjectsReducer } from "@/store/projects/reducer.ts";
import { ProjectReducer } from "@/store/project/reducer.tsx";

export const rootReducer = combineReducers({
  projects: ProjectsReducer,
  project: ProjectReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
