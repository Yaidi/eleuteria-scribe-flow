import { describe, it, expect } from "vitest";
import { charactersReducer } from "@/store/sections/charachters/reducer.ts";
import { addCharacter, removeCharacter, updateInfoCharacter } from "@/store";
import { mockCharacters } from "@/test/mocks";

describe("charactersReducer", () => {
  const character1 = mockCharacters[0];
  const character2 = mockCharacters[1];

  it("should add a character", () => {
    const nextState = charactersReducer([], addCharacter(character1));
    expect(nextState).toEqual([character1]);
  });

  it("should remove a character by id", () => {
    const initialState = [character1, character2];
    const nextState = charactersReducer(initialState, removeCharacter(1));
    expect(nextState).toEqual([character2]);
  });

  it("should update a character info by id", () => {
    const initialState = [character1];
    const updated = { id: 1, name: "Alice Updated", role: "Leader" };
    const nextState = charactersReducer(initialState, updateInfoCharacter(updated));

    expect(nextState).toEqual([
      {
        about: "The protagonist of the story, a detective with a troubled past.",
        characteristics: "Brave, intelligent, and resourceful",
        id: 1,
        importance: "Main",
        name: "Alice Updated",
        role: "Leader",
      },
    ]);
  });

  it("should not change state if update id does not match", () => {
    const initialState = [character1];
    const nextState = charactersReducer(
      initialState,
      updateInfoCharacter({ id: 0, name: "Ghost" }),
    );
    expect(nextState).toEqual(initialState);
  });
});
