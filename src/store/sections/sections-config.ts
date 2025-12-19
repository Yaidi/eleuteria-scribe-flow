import { IGeneral } from "@/types/sections.ts";
import { combineReducers } from "@reduxjs/toolkit";
import { generalReducer, initialStateGeneral } from "@/store/sections/general/reducer.ts";
import { initialStatePlots, IPlotsReducer, plotsReducer } from "@/store/sections/plots/reducer.ts";
import { initialStateWorld, worldReducer, WorldState } from "@/store/sections/world/reducer.ts";
import {
  IManuscriptReducer,
  initialStateManuscript,
  manuscriptReducer,
} from "@/store/sections/manuscript/reducer.ts";
import { charactersReducer, ICharactersState, initialStateCharacters } from "@/store";

export interface ISectionsReducer {
  general: IGeneral;
  characters: ICharactersState;
  plots: IPlotsReducer;
  world: WorldState;
  manuscript: IManuscriptReducer;
}

export const initialSectionsState: ISectionsReducer = {
  general: initialStateGeneral,
  characters: initialStateCharacters,
  plots: initialStatePlots,
  world: initialStateWorld,
  manuscript: initialStateManuscript,
};

export const sectionsReducer = combineReducers({
  general: generalReducer,
  characters: charactersReducer,
  plots: plotsReducer,
  world: worldReducer,
  manuscript: manuscriptReducer,
});
export type SectionsState = ReturnType<typeof sectionsReducer>;
