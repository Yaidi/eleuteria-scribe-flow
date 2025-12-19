import { createAction } from "@reduxjs/toolkit";
import { ICharacter } from "@/types/sections.ts";

export const setCurrentCharacter = createAction<ICharacter>(
  "Section [Character] Set Current Character",
);
