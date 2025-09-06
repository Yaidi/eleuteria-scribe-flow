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
    const element = result.worldElements[3];
    expect(element.id).toBe(3);
    expect(element.name).toBe("New Element");
    expect(element.parentId).toBe(null);
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
    expect(result.worldElements[1]).toBeUndefined();
    expect(result.currentWorldElement).toBeNull();
  });

  test("should handle setCurrentWorldElement", () => {
    const action = setCurrentWorldElement(mockWorldElements[0]);
    const result = worldReducer(initialState, action);
    expect(result.currentWorldElement).toEqual(mockWorldElements[0]);
  });

  test("should update element without change parentId", () => {
    const action = {
      type: updateWorldElement.fulfilled.type,
      payload: { id: 2, name: "Updated element", parentId: null },
    };
    const stateWithElement: WorldState = {
      ...initialState,
      worldElements: {
        2: { ...mockWorldElements[1], parentId: null, childrenIds: [] },
      },
    };

    const newState = worldReducer(stateWithElement, action);

    expect(newState.worldElements[2].name).toBe("Updated element");
    expect(newState.worldElements[2].parentId).toBe(null); //
  });

  test("should move the element to a new parent", () => {
    const action = {
      type: updateWorldElement.fulfilled.type,
      payload: { id: 2, parentId: 4 },
    };
    const stateWithoutParent: WorldState = {
      ...initialState,
      worldElements: {
        1: {
          id: 1,
          name: "Root",
          description: "",
          conflictCause: "",
          origin: "",
          worldId: 1,
          parentId: null,
          childrenIds: [2],
        },
        2: {
          id: 2,
          name: "Root",
          description: "",
          conflictCause: "",
          origin: "",
          worldId: 1,
          parentId: 1,
          childrenIds: [],
        },
        4: {
          id: 4,
          name: "",
          description: "",
          conflictCause: "",
          origin: "",
          worldId: 1,
          parentId: null,
          childrenIds: [],
        },
      },
    };

    const newState = worldReducer(stateWithoutParent, action);

    // ya no debe estar en el padre anterior (1)
    expect(newState.worldElements[1].childrenIds).not.toContain(2);
    // debe estar en el nuevo padre (3)
    expect(newState.worldElements[4].childrenIds).toContain(2);
    // y su parentId se actualizó
    expect(newState.worldElements[2].parentId).toBe(4);
  });

  test("should assign a parent", () => {
    const stateWithoutParent: WorldState = {
      ...initialState,
      worldElements: {
        1: {
          id: 1,
          name: "Root",
          description: "",
          conflictCause: "",
          origin: "",
          worldId: 1,
          parentId: null,
          childrenIds: [],
        },
        4: {
          id: 4,
          name: "",
          description: "",
          conflictCause: "",
          origin: "",
          worldId: 1,
          parentId: null,
          childrenIds: [],
        },
      },
    };

    const action = {
      type: updateWorldElement.fulfilled.type,
      payload: { id: 4, parentId: 1 },
    };

    const newState = worldReducer(stateWithoutParent, action);

    expect(newState.worldElements[4].parentId).toBe(1);
    expect(newState.worldElements[1].childrenIds).toContain(4);
  });
});
