import { createAsyncThunk } from "@reduxjs/toolkit";
import { IGeneral } from "@/types/sections.ts";
import { host } from "@/https/fetch.ts";

export interface requestGeneral {
  projectId: number;
  general: Partial<IGeneral>;
}
export const updateGeneral = createAsyncThunk<IGeneral, requestGeneral>(
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
    const responseData = (await response.json()).general;
    return responseData as IGeneral;
  },
);
