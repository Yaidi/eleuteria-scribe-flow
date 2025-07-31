import { createAsyncThunk } from "@reduxjs/toolkit";
import { IGeneral } from "@/types/sections.ts";
import { host } from "@/https/fetch.ts";

export interface requestGeneral {
  projectId: number;
  general: Partial<IGeneral>;
}

export interface responseUpdateGeneral {
  general: IGeneral;
  projectName: string;
  projectId: number;
}
export const updateGeneral = createAsyncThunk<responseUpdateGeneral, requestGeneral>(
  "[General] Update info",
  async ({ projectId, general }) => {
    const response = await fetch(`${host}/projects/${projectId}/general`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...general,
      }),
    });
    if (!response.ok) {
      throw new Error("Error update General Info");
    }
    return await response.json();
  },
);
