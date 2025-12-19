import { createReducer } from "@reduxjs/toolkit";
import {
  addWorldElement,
  removeWorldElement,
  setCurrentWorldElement,
  updateWorldElement,
} from "@/store/sections";
import {
  IWorld,
  IWorldElement,
  IWorldElementsObject,
  IWorldElementWithChildren,
} from "@/types/sections";
import { getProjectFetch } from "@/store";

export interface WorldState {
  world: IWorld | null;
  worldElements: IWorldElementsObject;
  currentWorldElement: IWorldElement | null;
}

export const initialStateWorld: WorldState = {
  world: null,
  worldElements: {},
  currentWorldElement: null,
};

export const worldReducer = createReducer(initialStateWorld, (builder) => {
  builder
    .addCase(getProjectFetch.fulfilled, (state, { payload }) => {
      const worlds = normalizeWorld(payload.sections.world);
      return {
        ...state,
        ...worlds,
      };
    })
    .addCase(removeWorldElement.fulfilled, (state, { payload }) => {
      return {
        ...state,
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
      return {
        ...state,
        worldElements: {
          ...state.worldElements,
          [payload.id]: { ...payload, childrenIds: [] }, // Add childrenIds for consistency
        },
        currentWorldElement: payload,
      };
    })
    .addCase(updateWorldElement.fulfilled, (state, { payload }) => {
      const elementId = payload.id!;
      const prevParentId = state.worldElements[elementId]?.parentId ?? null;
      const nextParentId = payload.parentId ?? null;

      // 1. Update the element itself
      let updatedWorldElements = {
        ...state.worldElements,
        [elementId]: {
          ...state.worldElements[elementId],
          ...payload,
        },
      };

      // 2. Remove from previous parent if changed
      if (prevParentId && prevParentId !== nextParentId) {
        updatedWorldElements = {
          ...updatedWorldElements,
          [prevParentId]: {
            ...updatedWorldElements[prevParentId],
            childrenIds: updatedWorldElements[prevParentId].childrenIds.filter(
              (cid: number) => cid !== elementId,
            ),
          },
        };
      }

      // 3. Add to new parent if changed
      if (nextParentId !== null) {
        updatedWorldElements = {
          ...updatedWorldElements,
          [nextParentId]: {
            ...updatedWorldElements[nextParentId],
            childrenIds: [
              ...new Set([...updatedWorldElements[nextParentId].childrenIds, elementId]),
            ],
          },
        };
      }

      return {
        ...state,
        worldElements: updatedWorldElements,
        currentWorldElement: {
          ...state.currentWorldElement!,
          ...payload,
        },
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
