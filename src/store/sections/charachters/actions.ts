import { createAction } from "@reduxjs/toolkit";
import { ICharacter } from "@/types/sections.ts";

export const addCharacter = createAction<ICharacter>("[Character] Add Character");

export const updateInfoCharacter = createAction<Partial<ICharacter>>(
  "[Character] Update Character",
);

export const removeCharacter = createAction<number>("[Character] Remove Character");
