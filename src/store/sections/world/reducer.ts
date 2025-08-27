import { createReducer } from "@reduxjs/toolkit";
import {
  addWorldElement,
  removeWorldElement,
  setCurrentWorldElement,
  updateWorldElement,
} from "@/store/sections";
import { IWorld, IWorldElement, IWorldElementWithChildren } from "@/types/sections";
import { getProjectFetch } from "@/store";

export interface WorldState {
  world: IWorld | null;
  worldElements: Record<number, IWorldElementWithChildren>;
  currentWorldElement: IWorldElement | null;
}

const initialState: WorldState = {
  world: null,
  worldElements: {},
  currentWorldElement: null,
};

export const worldReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getProjectFetch.fulfilled, (state, { payload }) => {
      const worlds = normalizeWorld(payload.sections.world);
      return {
        ...state,
        ...worlds,
      };
    })
    .addCase(removeWorldElement.fulfilled, (state, { payload }) => {
      if (!state.world) return state; // Ensure state.world is not null

      return {
        ...state,
        world: {
          ...state.world,
          worldElements: state.world.worldElements.filter((element) => element.id !== payload.id),
        },
        worldElements: Object.fromEntries(
          Object.entries(state.worldElements).filter(([key]) => parseInt(key, 10) !== payload.id),
        ),
        currentWorldElement: null,
      };
    })
    .addCase(setCurrentWorldElement, (state, { payload }) => {
      return {
        ...state,
        currentWorldElement: payload,
      };
    })
    .addCase(addWorldElement.fulfilled, (state, { payload }) => {
      if (!state.world) return state; // Ensure state.world is not null

      return {
        ...state,
        world: {
          ...state.world,
          worldElements: [
            ...state.world.worldElements,
            { ...payload, childrenIds: [] }, // Ensure payload matches IWorldElementWithChildren
          ],
        },
        worldElements: {
          ...state.worldElements,
          [payload.id]: { ...payload, childrenIds: [] }, // Add childrenIds for consistency
        },
        currentWorldElement: payload,
      };
    })
    .addCase(updateWorldElement.fulfilled, (state, { payload }) => {
      if (!state.world) return state; // Ensure state.world is not null
      if (!payload.id) return state; // Ensure payload has an id

      return {
        ...state,
        world: {
          ...state.world,
          worldElements: state.world.worldElements.map((element) =>
            element.id === payload.id ? { ...element, ...payload } : element,
          ),
        },
        worldElements: {
          ...state.worldElements,
          [payload.id]: {
            ...state.worldElements[payload.id],
            ...payload,
          },
        },
        currentWorldElement:
          state.currentWorldElement?.id === payload.id
            ? { ...state.currentWorldElement, ...payload }
            : state.currentWorldElement,
      };
    });
});

function normalizeWorld(worldFromApi: IWorld): WorldState {
  const worldElements: Record<string, IWorldElementWithChildren> = {};

  for (const el of worldFromApi.worldElements) {
    worldElements[el.id] = { ...el, childrenIds: [] };
  }

  for (const el of worldFromApi.worldElements) {
    if (el.parentId) {
      worldElements[el.parentId]?.childrenIds.push(el.id);
    }
  }

  const rootElements = Object.values(worldElements).filter((el) => el.parentId === null);

  const world: IWorld = {
    id: worldFromApi.id,
    worldElements: rootElements,
    projectID: worldFromApi.projectID,
  };

  return {
    world,
    worldElements,
    currentWorldElement: null,
  };
}
