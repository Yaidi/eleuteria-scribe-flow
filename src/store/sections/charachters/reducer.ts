import { createReducer } from "@reduxjs/toolkit";
import { ICharacter } from "@/types/sections";
import {
  addCharacterFetch,
  deleteCharacterFetch,
  updateCharacter,
} from "@/store/sections/charachters/slice.ts";
import { getProjectFetch } from "@/store/projects/slice.ts";

export interface ICharactersState {
  characters: ICharacter[];
  currentCharacter: ICharacter | null;
}

const initialState: ICharactersState = {
  characters: [],
  currentCharacter: null,
};

export const charactersReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getProjectFetch.fulfilled, (_state, { payload }) => {
      return {
        ..._state,
        characters: payload.sections.characters,
      };
    })
    .addCase(addCharacterFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        characters: [...state.characters, payload],
      };
    })
    .addCase(deleteCharacterFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        characters: state.characters.filter((character) => character.id !== payload),
      };
    })
    .addCase(updateCharacter.fulfilled, (state, { payload }) => {
      return {
        ...state,
        characters: state.characters.map((character) =>
          character.id === payload.id ? { ...character, ...payload } : character,
        ),
      };
    });
});
