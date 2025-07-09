import { createAction } from "@reduxjs/toolkit";
import { ICharacter } from "@/types/sections.ts";

export const setCurrentCharacter = createAction<ICharacter>("[Character] Set Current Character");
