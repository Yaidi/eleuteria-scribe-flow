import { describe, it, expect } from "vitest";
import {
  addCharacterFetch,
  charactersReducer,
  deleteCharacterFetch,
  setCurrentCharacter,
  updateCharacter,
} from "@/store";
import { UnknownAction } from "@reduxjs/toolkit";
import { mockCharacters, mockProjectData, mockProjectSections } from "../../../mocks";
import { getProjectFetch } from "@/store/projects/slice.ts";

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
  it("should handle delete a character", () => {
    const action: UnknownAction = {
      type: deleteCharacterFetch.fulfilled.type,
      payload: mockCharacters[1].id,
    };
    const result = charactersReducer(
      { currentCharacter: mockCharacters[1], characters: mockCharacters },
      action,
    );
    expect(result.characters).not.toContainEqual(mockCharacters[1]);
  });
  it("should handle update a character", () => {
    const action: UnknownAction = {
      type: updateCharacter.fulfilled.type,
      payload: { ...mockCharacters[1], name: "Yaidi" },
    };
    const result = charactersReducer(
      { currentCharacter: mockCharacters[1], characters: mockCharacters },
      action,
    );
    expect(result.characters[1]).toEqual({ ...mockCharacters[1], name: "Yaidi" });
  });
  it("should get characters from Project", () => {
    const action: UnknownAction = {
      type: getProjectFetch.fulfilled.type,
      payload: mockProjectData,
    };
    const result = charactersReducer(initialState, action);
    expect(result.characters).toEqual(mockProjectSections.characters);
  });
  it("should set current character", () => {
    const action: UnknownAction = {
      type: setCurrentCharacter.type,
      payload: mockCharacters[1],
    };
    const result = charactersReducer(initialState, action);
    expect(result.currentCharacter).toEqual(mockCharacters[1]);
  });
});
