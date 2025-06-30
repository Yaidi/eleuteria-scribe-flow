import { ICharacter, IGeneral } from "@/types/sections.ts";
import { combineReducers } from "@reduxjs/toolkit";
import { generalReducer } from "@/store/sections/general/reducer.ts";
import { charactersReducer } from "@/store/sections/charachters/reducer.ts";
import { IPlotsReducer, plotsReducer } from "@/store/sections/plots/reducer.ts";
import { IWorldReducer, worldReducer } from "@/store/sections/world/reducer.ts";
import { IManuscriptReducer, manuscriptReducer } from "@/store/sections/manuscript/reducer.ts";

export interface ISectionsReducer {
  general: IGeneral;
  characters: ICharacter[];
  plots: IPlotsReducer;
  world: IWorldReducer;
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
