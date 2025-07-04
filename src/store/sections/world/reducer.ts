import { createReducer } from "@reduxjs/toolkit";
import { removeWorldElement } from "@/store/sections";
import { IWorld } from "@/types/sections";

export interface IWorldReducer {
  world: IWorld;
  currentWorldElement: number | null;
}

const initialState: IWorldReducer = {
  world: {
    id: 0,
    projectID: 1,
    worldElements: [],
  },
  currentWorldElement: null,
};

export const worldReducer = createReducer(initialState, (builder) => {
  builder.addCase(removeWorldElement, (state, { payload }) => {
    return {
      ...state,
      world: {
        ...state.world,
        worldElements: state.world.worldElements.filter((element) => element.id !== payload),
      },
    };
  });
});
