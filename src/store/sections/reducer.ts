import { ICharacter, IGeneral, IPlot, IWorld } from "@/types/sections.ts";
import { combineReducers } from "@reduxjs/toolkit";
import { generalReducer } from "@/store/sections/general/reducer.ts";
import { charactersReducer } from "@/store/sections/charachters/reducer.ts";
import { plotsReducer } from "@/store/sections/plots/reducer.ts";
import { worldReducer } from "@/store/sections/world/reducer.ts";
import { IManuscriptReducer, manuscriptReducer } from "@/store/sections/manuscript/reducer.ts";

export interface ISectionsReducer {
  general: IGeneral;
  characters: ICharacter[];
  plots: IPlot[];
  world: IWorld;
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
