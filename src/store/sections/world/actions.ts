import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { IWorldElement } from "@/types/sections.ts";
import { host } from "@/https/fetch.ts";
import { responseDelete } from "@/store";

export const removeWorldElement = createAsyncThunk<responseDelete, number>(
  "[World] Remove Element of World",
  async (id) => {
    const response = await fetch(`${host}/world/element/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error removing world element");
    }
    return (await response.json()) as responseDelete;
  },
);

export const updateWorldElement = createAsyncThunk<Partial<IWorldElement>, Partial<IWorldElement>>(
  "[World] Update Element to World",
  async (worldElement) => {
    const response = await fetch(`${host}/world/element/${worldElement.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...worldElement,
      }),
    });
    const responseData = await response.json();
    return responseData as IWorldElement;
  },
);

export const addWorldElement = createAsyncThunk<IWorldElement, number>(
  "[World] Add Element to World",
  async (worldId) => {
    const response = await fetch(`${host}/world/element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        worldID: worldId,
      }),
    });
    if (!response.ok) {
      throw new Error("Error Add plot");
    }
    const responseData = await response.json();
    return responseData as IWorldElement;
  },
);

export const setCurrentWorldElement = createAction<IWorldElement>(
  "[World] Set Current World Element",
);
