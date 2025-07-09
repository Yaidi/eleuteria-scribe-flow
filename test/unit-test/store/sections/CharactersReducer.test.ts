import { describe, it, expect } from "vitest";
import { addCharacterFetch, charactersReducer } from "@/store";
import { UnknownAction } from "@reduxjs/toolkit";
import { mockCharacters } from "../../../mocks";

describe("charactersReducer", () => {
  const initialState = {
    characters: [],
    currentCharacter: null,
  };

  it("should return the initial state when passed an undefined state", () => {
    const action: UnknownAction = { type: "" };
    const result = charactersReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  it("should handle adding a character", () => {
    const action: UnknownAction = {
      type: addCharacterFetch.fulfilled.type,
      payload: mockCharacters[1],
    };
    const result = charactersReducer(initialState, action);
    expect(result.characters).toContainEqual(mockCharacters[1]);
  });
});
