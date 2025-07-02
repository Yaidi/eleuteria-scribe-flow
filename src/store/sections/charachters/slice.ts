import { createAsyncThunk } from "@reduxjs/toolkit";
import { RequestUpdateCharacter } from "@/types/requests.ts";
import { addCharacter, removeCharacter, updateInfoCharacter } from "@/store";
import { ICharacter } from "@/types/sections.ts";

export const updateCharacter = createAsyncThunk<ICharacter, RequestUpdateCharacter>(
  updateInfoCharacter.type,
  async ({ id, info }) => {
    const response = await fetch(`/api/characters/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...info,
      }),
    });
    if (!response.ok) {
      throw new Error("Error UPDTAE CHARACTER");
    }
    return (await response.json()) as ICharacter;
  },
);

export const addCharacterFetch = createAsyncThunk<ICharacter, number | undefined>(
  addCharacter.type,
  async (projectId) => {
    const response = await fetch(`/api/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ baseWritingProjectID: projectId }),
    });
    if (!response.ok) {
      throw new Error("Error POST CHARACTER");
    }
    return (await response.json()) as ICharacter;
  },
);

export const deleteCharacterFetch = createAsyncThunk<number, number>(
  removeCharacter.type,
  async (id) => {
    const response = await fetch(`/api/characters/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error DELETE CHARACTERS");
    }
    return id;
  },
);
