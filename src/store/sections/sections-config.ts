import { IGeneral } from "@/types/sections.ts";
import { combineReducers } from "@reduxjs/toolkit";
import { generalReducer } from "@/store/sections/general/reducer.ts";
import { IPlotsReducer, plotsReducer } from "@/store/sections/plots/reducer.ts";
import { worldReducer, WorldState } from "@/store/sections/world/reducer.ts";
import { IManuscriptReducer, manuscriptReducer } from "@/store/sections/manuscript/reducer.ts";
import { charactersReducer, ICharactersState } from "@/store";

export interface ISectionsReducer {
  general: IGeneral;
  characters: ICharactersState;
  plots: IPlotsReducer;
  world: WorldState;
  manuscript: IManuscriptReducer;
}

export const SectionsReducer = combineReducers({
  general: generalReducer,
  characters: charactersReducer,
  plots: plotsReducer,
  world: worldReducer,
  manuscript: manuscriptReducer,
});
export type SectionsState = ReturnType<typeof SectionsReducer>;
