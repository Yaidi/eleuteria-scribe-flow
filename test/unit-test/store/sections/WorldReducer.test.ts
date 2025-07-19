import { describe, expect, test } from "vitest";
import { IWorldReducer, worldReducer } from "@/store/sections/world/reducer.ts";
import { removeWorldElement } from "@/store";
import { mockWorldElements } from "../../../mocks";

describe("WorldReducer", () => {
  const initialState: IWorldReducer = {
    world: {
      id: 0,
      projectID: 1,
      worldElements: [],
    },
    currentWorldElement: null,
  };
  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = worldReducer(initialState, action);
    expect(result).toEqual(initialState);
  });
  test("should handle remove world element", () => {
    const result = worldReducer(initialState, removeWorldElement(mockWorldElements[0].id));
    expect(result.world.worldElements).not.toContain(mockWorldElements[0]);
  });
});
