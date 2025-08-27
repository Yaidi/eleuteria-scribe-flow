import { createAsyncThunk } from "@reduxjs/toolkit";
import { IProject, ProjectData } from "@/types/project.ts";
import { RequestAddProject, ResponseId, ResponseProjects } from "@/types/requests.ts";
import { setCurrentId } from "@/store/electron/actions.ts";
import { host } from "@/https/fetch.ts";

export const projectsFetch = createAsyncThunk<IProject[]>("[Projects] Get Projects", async () => {
  const response = await fetch(`${host}/getProjectList?id=1`);
  if (!response.ok) {
    throw new Error("Error fetching projects");
  }
  const res = (await response.json()) as ResponseProjects;
  return res.projects;
});

export const getProjectFetch = createAsyncThunk<ProjectData, number>(
  "[Project] Get Project",
  async (id: number) => {
    const response = await fetch(`${host}/getProject?id=${id}`);
    if (!response.ok) {
      throw new Error("Error fetching projects");
    }
    await setCurrentId(id);
    return (await response.json()) as ProjectData;
  },
);

export const addProjectFetch = createAsyncThunk<ProjectData, RequestAddProject>(
  "[Projects] Add Project",
  async (body: RequestAddProject) => {
    const response = await fetch(`${host}/addProject`, {
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

export const removeProject = createAsyncThunk<ResponseId, number>(
  "[Project] Remove Project",
  async (id: number) => {
    const response = await fetch(`${host}/deleteProject/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error fetching projects");
    }
    return await response.json();
  },
);
