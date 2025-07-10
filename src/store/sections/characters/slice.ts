import { createAsyncThunk } from "@reduxjs/toolkit";
import { RequestUpdateCharacter } from "@/types/requests.ts";
import { ICharacter } from "@/types/sections.ts";
import { host } from "@/https/fetch.ts";

export const updateCharacter = createAsyncThunk<ICharacter, RequestUpdateCharacter>(
  "[Character] Update Character",
  async ({ id, info }) => {
    const response = await fetch(`${host}/characters/${id}`, {
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
  "[Character] Add Character",
  async (projectId) => {
    const response = await fetch(`${host}/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectID: projectId }),
    });
    if (!response.ok) {
      throw new Error("Error POST CHARACTER");
    }
    return (await response.json()) as ICharacter;
  },
);

export const deleteCharacterFetch = createAsyncThunk<number, number>(
  "[Character] Remove Character",
  async (id) => {
    const response = await fetch(`${host}/characters/${id}`, {
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
