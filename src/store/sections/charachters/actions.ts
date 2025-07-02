import { createAction } from "@reduxjs/toolkit";
import { ICharacter } from "@/types/sections.ts";
import { RequestUpdateCharacter } from "@/types/requests.ts";

export const addCharacter = createAction<Partial<ICharacter>>("[Character] Add Character");

export const updateInfoCharacter = createAction<RequestUpdateCharacter>(
  "[Character] Update Character",
);

export const removeCharacter = createAction<number>("[Character] Remove Character");

export const setCurrentCharacter = createAction<ICharacter>("[Character] Add Character");
