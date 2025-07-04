import { createAsyncThunk } from "@reduxjs/toolkit";
import { addProject, getCurrentProject, getProjects } from "@/store";
import { ProjectData } from "@/types/project.ts";
import { RequestAddProject } from "@/types/requests.ts";
import { setCurrentId } from "@/store/electron/actions.ts";

export const projectsFetch = createAsyncThunk<ProjectData[]>(getProjects.type, async () => {
  const response = await fetch("/api/getProjectList?id=1");
  if (!response.ok) {
    throw new Error("Error fetching projects");
  }
  return (await response.json()) as ProjectData[];
});

export const getProjectFetch = createAsyncThunk<ProjectData, number>(
  getCurrentProject.type,
  async (id: number) => {
    const response = await fetch(`/api/getProject?id=${id}`);
    if (!response.ok) {
      throw new Error("Error fetching projects");
    }
    return (await response.json()) as ProjectData;
  },
);

export const addProjectFetch = createAsyncThunk<ProjectData, RequestAddProject>(
  addProject.type,
  async (body: RequestAddProject) => {
    const response = await fetch(`/api/addProject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error("Error fetching projects");
    }
    const data = (await response.json()) as ProjectData;
    await setCurrentId(data.id);
    return data;
  },
);
