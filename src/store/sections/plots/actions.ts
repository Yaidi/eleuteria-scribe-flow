import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ICharacter, IPlot } from "@/types/sections.ts";
import { host } from "@/https/fetch.ts";

export interface requestPlot {
  plot: Partial<IPlot>;
}
export interface responseDelete {
  id: number;
}

export const updatePlot = createAsyncThunk<IPlot, requestPlot>(
  "[Plot] Update Plot",
  async ({ plot }) => {
    const response = await fetch(`${host}/plot/${plot.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...plot,
      }),
    });
    if (!response.ok) {
      throw new Error("Error update plot");
    }
    const responseData = await response.json();
    return responseData as IPlot;
  },
);

export const removePlot = createAsyncThunk<responseDelete, number>(
  "[Plot] Remove Plot",
  async (id) => {
    const response = await fetch(`${host}/plot/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error remove plot");
    }
    return (await response.json()) as responseDelete;
  },
);

export const addPlot = createAsyncThunk<IPlot, number>("[Plot] Add Plot", async (projectId) => {
  const response = await fetch(`${host}/plot/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectID: projectId,
    }),
  });
  if (!response.ok) {
    throw new Error("Error update plot");
  }
  const responseData = await response.json();
  return responseData as IPlot;
});

export const setCurrentPlot = createAction<IPlot>("[Plot] Set Current Plot");

export const getAllCharacters = createAsyncThunk<ICharacter[], number>(
  "[Characters] Get Characters",
  async (projectId) => {
    const response = await fetch(`${host}/characters/from_project/${projectId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response) {
      throw new Error("Error getting all the characters");
    }

    const responseData = await response.json();
    return responseData as ICharacter[];
  },
);
