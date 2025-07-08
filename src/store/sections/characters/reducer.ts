import { createReducer } from "@reduxjs/toolkit";
import { ICharacter } from "@/types/sections";
import { getProjectFetch } from "@/store/projects/slice.ts";
import {
  addCharacterFetch,
  deleteCharacterFetch,
  updateCharacter,
} from "@/store/sections/characters/slice.ts";
import { setCurrentCharacter } from "@/store/sections/characters/actions.ts";

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
        currentCharacter: payload,
      };
    })
    .addCase(setCurrentCharacter, (state, { payload }) => {
      return {
        ...state,
        currentCharacter: payload,
      };
    })
    .addCase(deleteCharacterFetch.fulfilled, (state, { payload }) => {
      return {
        ...state,
        characters: state.characters.filter((character) => character.id !== payload),
        currentCharacter: null,
      };
    })
    .addCase(updateCharacter.fulfilled, (state, { payload }) => {
      return {
        ...state,
        characters: state.characters.map((character) =>
          character.id === payload.id ? { ...character, ...payload } : character,
        ),
        currentCharacter: { ...state.currentCharacter, ...payload },
      };
    });
});
