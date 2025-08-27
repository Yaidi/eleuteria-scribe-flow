import { describe, expect, test } from "vitest";
import { worldReducer, WorldState } from "@/store/sections/world/reducer.ts";
import {
  addWorldElement,
  getProjectFetch,
  removeWorldElement,
  setCurrentWorldElement,
  updateWorldElement,
} from "@/store";
import { UnknownAction } from "@reduxjs/toolkit";
import { mockWorld, mockWorldElements } from "../../../mocks";

describe("WorldReducer", () => {
  const initialState: WorldState = {
    world: {
      id: 0,
      projectID: 1,
      worldElements: [],
    },
    currentWorldElement: null,
    worldElements: {},
  };

  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = worldReducer(initialState, action);
    expect(result).toEqual(initialState);
  });
  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = worldReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  test("should handle getProjectFetch.fulfilled (normalize world)", () => {
    const action: UnknownAction = {
      type: getProjectFetch.fulfilled.type,
      payload: { sections: { world: mockWorld } },
    };
    const result = worldReducer(initialState, action);

    expect(result.world?.worldElements).toHaveLength(1);
    expect(result.world?.worldElements[0].id).toBe(1);

    expect(result.worldElements[1]).toBeDefined();
    expect(result.worldElements[2]).toBeDefined();

    expect(result.worldElements[1].childrenIds).toContain(2);
  });

  test("should handle addWorldElement.fulfilled", () => {
    const action: UnknownAction = {
      type: addWorldElement.fulfilled.type,
      payload: { id: 3, name: "New Element", parentId: null },
    };
    const stateWithWorld: WorldState = {
      ...initialState,
      world: { ...mockWorld, worldElements: [] },
      worldElements: {},
    };

    const result = worldReducer(stateWithWorld, action);
    expect(result.world?.worldElements).toContainEqual({
      id: 3,
      name: "New Element",
      parentId: null,
      childrenIds: [],
    });
    expect(result.worldElements[3]).toBeDefined();
    expect(result.currentWorldElement?.id).toBe(3);
  });

  test("should handle updateWorldElement.fulfilled", () => {
    const action: UnknownAction = {
      type: updateWorldElement.fulfilled.type,
      payload: { id: 1, name: "Updated Root" },
    };
    const stateWithWorld: WorldState = {
      ...initialState,
      world: { ...mockWorld, worldElements: [{ ...mockWorldElements[0] }] },
      worldElements: {
        1: { ...mockWorldElements[0], childrenIds: [] },
      },
      currentWorldElement: { ...mockWorldElements[0] },
    };

    const result = worldReducer(stateWithWorld, action);
    expect(result.world?.worldElements[0].name).toBe("Updated Root");
    expect(result.worldElements[1].name).toBe("Updated Root");
    expect(result.currentWorldElement?.name).toBe("Updated Root");
  });

  test("should handle removeWorldElement.fulfilled", () => {
    const action: UnknownAction = {
      type: removeWorldElement.fulfilled.type,
      payload: { id: 1 },
    };
    const stateWithWorld: WorldState = {
      ...initialState,
      world: { ...mockWorld, worldElements: [{ ...mockWorldElements[0] }] },
      worldElements: {
        1: { ...mockWorldElements[0], childrenIds: [] },
      },
      currentWorldElement: { ...mockWorldElements[0] },
    };

    const result = worldReducer(stateWithWorld, action);
    expect(result.world?.worldElements).toHaveLength(0);
    expect(result.worldElements[1]).toBeUndefined();
    expect(result.currentWorldElement).toBeNull();
  });

  test("should handle setCurrentWorldElement", () => {
    const action = setCurrentWorldElement(mockWorldElements[0]);
    const result = worldReducer(initialState, action);
    expect(result.currentWorldElement).toEqual(mockWorldElements[0]);
  });
});
